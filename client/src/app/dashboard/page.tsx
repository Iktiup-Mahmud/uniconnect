"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  MessageCircle,
  Share2,
  LogOut,
  Users,
  Image as ImageIcon,
  Video,
  Smile,
  Bell,
  Search,
  Trash2,
  MoreHorizontal,
  Clock,
  Send,
  Home,
  Compass,
  Calendar,
  Settings,
} from "lucide-react";
import { Post, User, Comment as CommentType } from "@/types";
import { api } from "@/lib/api";

export default function DashboardPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [postContent, setPostContent] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(
    new Set()
  );
  const [commentsByPost, setCommentsByPost] = useState<Record<string, CommentType[]>>({});
  const [friends, setFriends] = useState<User[]>([]);

  const fetchPosts = async () => {
    try {
      const response = await api.getPosts();
      if (response.success && response.data) {
        setPosts(response.data.posts || []);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
      // Optionally show error to user
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token) {
      router.push("/login");
    } else {
      setIsAuthenticated(true);
      if (userData) {
        setUser(JSON.parse(userData));
      }
      fetchPosts();
      fetchFriends();
    }
  }, [router]);

  const fetchFriends = async () => {
    try {
      const response = await api.getUsers();
      if (response.success && response.data) {
        const userData = localStorage.getItem("user");
        const currentUser = userData ? JSON.parse(userData) : null;
        // Filter out current user and limit to 9 friends
        const filteredFriends = (response.data.users || [])
          .filter((friend: User) => {
            return (
              friend._id !== currentUser?._id && friend._id !== currentUser?.id
            );
          })
          .slice(0, 9);
        setFriends(filteredFriends);
      }
    } catch (error) {
      console.error("Error fetching friends:", error);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...files].slice(0, 10)); // Max 10 files
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCreatePost = async () => {
    if ((!postContent.trim() && selectedFiles.length === 0) || isLoading)
      return;

    setIsLoading(true);
    setUploadingMedia(true);

    try {
      let imageUrls: string[] = [];
      let videoUrls: string[] = [];

      // Upload files if any
      if (selectedFiles.length > 0) {
        try {
          const uploadResponse = await api.uploadMultipleMedia(selectedFiles);
          if (uploadResponse.success && uploadResponse.data) {
            // Separate images and videos based on file type
            selectedFiles.forEach((file, index) => {
              if (file.type.startsWith("video/")) {
                videoUrls.push(uploadResponse.data.urls[index]);
              } else {
                imageUrls.push(uploadResponse.data.urls[index]);
              }
            });
          }
        } catch (uploadError) {
          console.error("Error uploading media:", uploadError);
          alert("Failed to upload media files");
          setIsLoading(false);
          setUploadingMedia(false);
          return;
        }
      }

      // Create post with content and media
      const response = await api.createPost({
        content: postContent.trim() || undefined,
        images: imageUrls.length > 0 ? imageUrls : undefined,
        videos: videoUrls.length > 0 ? videoUrls : undefined,
      });

      if (response.success) {
        setPostContent("");
        setSelectedFiles([]);
        await fetchPosts();
      } else {
        console.error("Failed to create post:", response.message);
      }
    } catch (error: unknown) {
      console.error("Error creating post:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create post";
      alert(errorMessage);
    } finally {
      setIsLoading(false);
      setUploadingMedia(false);
    }
  };

  const handleLikePost = async (postId: string) => {
    try {
      const response = await api.likePost(postId);
      if (response.success) {
        await fetchPosts();
      }
    } catch (error: unknown) {
      console.error("Error liking post:", error);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
      const response = await api.deletePost(postId);
      if (response.success) {
        await fetchPosts();
      } else {
        alert(response.message || "Failed to delete post");
      }
    } catch (error: unknown) {
      console.error("Error deleting post:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete post";
      alert(errorMessage);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  };

  const handleStartConversation = async (userId: string) => {
    try {
      const response = await api.createConversation({
        participantIds: [userId],
        type: "direct",
      });
      if (response.success && response.data) {
        router.push(
          `/messages?conversationId=${response.data.conversation._id}`
        );
      }
    } catch (error: any) {
      console.error("Error creating conversation:", error);
      // If conversation already exists, try to find it
      try {
        const conversationsResponse = await api.getConversations();
        if (conversationsResponse.success && conversationsResponse.data) {
          const existingConv = conversationsResponse.data.conversations.find(
            (conv: any) => {
              return conv.participants.some((p: any) => {
                const pId = typeof p === "object" ? p._id : p;
                return pId === userId;
              });
            }
          );
          if (existingConv) {
            router.push(`/messages?conversationId=${existingConv._id}`);
            return;
          }
        }
      } catch (err) {
        console.error("Error finding conversation:", err);
      }
    }
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const postDate = new Date(date);
    const seconds = Math.floor((now.getTime() - postDate.getTime()) / 1000);

    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  // Comment Section Component
  const CommentSection = ({ postId }: { postId: string }) => {
    const [commentText, setCommentText] = useState("");
    const [loadingComments, setLoadingComments] = useState(false);
    const [submittingComment, setSubmittingComment] = useState(false);
    
    const comments = commentsByPost[postId] || [];

    const fetchComments = useCallback(async () => {
      // Only fetch if we haven't loaded comments for this post yet
      if (commentsByPost[postId]) return;
      
      setLoadingComments(true);
      try {
        const response = await api.getComments(postId);
        if (response.success && response.data) {
          setCommentsByPost((prev) => ({
            ...prev,
            [postId]: (response.data.comments || []) as unknown as CommentType[],
          }));
        }
      } catch (error) {
        console.error("Error fetching comments:", error);
      } finally {
        setLoadingComments(false);
      }
    }, [postId]); // Only recreate if postId changes

    useEffect(() => {
      fetchComments();
    }, [fetchComments]);

    const refreshComments = async () => {
      setLoadingComments(true);
      try {
        const response = await api.getComments(postId);
        if (response.success && response.data) {
          setCommentsByPost((prev) => ({
            ...prev,
            [postId]: (response.data.comments || []) as unknown as CommentType[],
          }));
        }
      } catch (error) {
        console.error("Error fetching comments:", error);
      } finally {
        setLoadingComments(false);
      }
    };

    const handleSubmitComment = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!commentText.trim() || submittingComment) return;

      setSubmittingComment(true);
      try {
        const response = await api.createComment(postId, commentText);
        if (response.success) {
          setCommentText("");
          await refreshComments();
          await fetchPosts(); // Refresh posts to update comment count
        }
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to post comment";
        alert(errorMessage);
      } finally {
        setSubmittingComment(false);
      }
    };

    const handleDeleteComment = async (commentId: string) => {
      if (!confirm("Delete this comment?")) return;
      try {
        const response = await api.deleteComment(commentId);
        if (response.success) {
          await refreshComments();
          await fetchPosts();
        }
      } catch (error) {
        console.error("Error deleting comment:", error);
      }
    };

    return (
      <div>
        {/* Comments List */}
        <div className="mb-4 max-h-64 space-y-3 overflow-y-auto">
          {loadingComments ? (
            <div className="py-4 text-center text-sm text-gray-500">
              Loading comments...
            </div>
          ) : comments.length === 0 ? (
            <div className="py-4 text-center text-sm text-gray-500">
              No comments yet
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment._id} className="flex gap-2">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarFallback className="bg-gradient-to-br from-purple-400 to-pink-500 text-xs text-white">
                    {typeof comment.userId === "object"
                      ? comment.userId.name.charAt(0)
                      : "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 rounded-lg bg-gray-50 p-2">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900">
                      {typeof comment.userId === "object"
                        ? comment.userId.name
                        : "User"}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatTimeAgo(comment.createdAt)}
                    </span>
                    {(typeof comment.userId === "object" &&
                      comment.userId._id === user?._id) ||
                    user?.role === "admin" ? (
                      <button
                        onClick={() => handleDeleteComment(comment._id)}
                        className="ml-auto text-xs text-red-500 hover:text-red-700"
                      >
                        Delete
                      </button>
                    ) : null}
                  </div>
                  <p className="text-sm text-gray-700">{comment.content}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Comment Input */}
        <form onSubmit={handleSubmitComment} className="flex gap-2">
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarFallback className="bg-gradient-to-br from-cyan-400 to-blue-500 text-xs text-black">
              {user?.name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <Input
            placeholder="Write a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="flex-1 rounded-full border-gray-300 text-black"
          />
          <Button
            type="submit"
            disabled={!commentText.trim() || submittingComment}
            size="sm"
            className="rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-purple-50">
      {/* Top Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b border-blue-100 bg-white/90 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-[1800px] items-center justify-between px-6">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/30">
              <Users className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
              UniConnect
            </span>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-cyan-400" />
              <Input
                type="text"
                placeholder="Search"
                className="h-11 w-full rounded-xl border-cyan-200 bg-gradient-to-r from-cyan-50 to-blue-50 pl-12 focus:border-cyan-400 focus:bg-white focus:ring-2 focus:ring-cyan-200 text-black"
              />
            </div>
          </div>

          {/* Top Nav Icons */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/dashboard")}
              className="relative rounded-xl text-cyan-600 hover:bg-cyan-50"
            >
              <Home className="h-6 w-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/search")}
              className="relative rounded-xl text-gray-600 hover:bg-gray-50"
              title="Search"
            >
              <Search className="h-6 w-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/courses")}
              className="relative rounded-xl text-purple-600 hover:bg-purple-50"
              title="Courses"
            >
              <Compass className="h-6 w-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/events")}
              className="relative rounded-xl text-blue-600 hover:bg-blue-50"
              title="Events"
            >
              <Calendar className="h-6 w-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/clubs")}
              className="relative rounded-xl text-pink-600 hover:bg-pink-50"
              title="Clubs"
            >
              <Users className="h-6 w-6" />
            </Button>
            {user?.role === "admin" && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/admin")}
                className="relative rounded-xl text-purple-600 hover:bg-purple-50"
                title="Admin Panel"
              >
                <Settings className="h-6 w-6" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/messages")}
              className="relative rounded-xl text-green-600 hover:bg-green-50"
              title="Messages"
            >
              <MessageCircle className="h-6 w-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/notifications")}
              className="relative rounded-xl text-orange-600 hover:bg-orange-50"
              title="Notifications"
            >
              <Bell className="h-6 w-6" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/settings")}
              className="relative rounded-xl text-gray-600 hover:bg-gray-50"
              title="Settings"
            >
              <Settings className="h-5 w-5" />
            </Button>
            <button
              onClick={() => router.push("/profile")}
              className="ml-2 flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-100 to-blue-100 px-3 py-2 hover:from-cyan-200 hover:to-blue-200 transition-all cursor-pointer"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-sm font-semibold text-white">
                  {user?.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <span className="hidden text-sm font-semibold text-cyan-700 lg:block">
                {user?.name?.split(" ")[0] || "User"}
              </span>
            </button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="rounded-xl text-cyan-600 hover:bg-cyan-50"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-[1800px] pt-16">
        <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-12">
          {/* Left Sidebar */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-20 space-y-4">
              {/* Quick Links */}
              <Card className="overflow-hidden border-0 bg-white shadow-lg">
                <CardContent className="p-4">
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-cyan-600">
                    Quick Links
                  </h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => router.push("/courses")}
                      className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-400 to-pink-500">
                        <Compass className="h-5 w-5 text-white" />
                      </div>
                      <span className="text-sm font-semibold text-cyan-900">
                        Courses
                      </span>
                    </button>
                    <button
                      onClick={() => router.push("/clubs")}
                      className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                      <span className="text-sm font-semibold text-cyan-900">
                        Clubs
                      </span>
                    </button>
                    <button
                      onClick={() => router.push("/events")}
                      className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-400 to-cyan-500">
                        <Calendar className="h-5 w-5 text-white" />
                      </div>
                      <span className="text-sm font-semibold text-cyan-900">
                        Events
                      </span>
                    </button>
                  </div>
                </CardContent>
              </Card>

              {/* Friends List */}
              <Card className="overflow-hidden border-0 bg-white shadow-lg">
                <CardContent className="p-4">
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-cyan-600">
                    Friends
                  </h3>
                  <div className="space-y-2">
                    {friends.length === 0 ? (
                      <div className="text-center py-4 text-sm text-gray-500">
                        No friends yet
                      </div>
                    ) : (
                      friends.map((friend, i) => (
                        <div
                          key={friend._id}
                          className="flex items-center justify-between rounded-lg p-2 transition-colors hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50 cursor-pointer group"
                          onClick={(e) => {
                            // Check if clicking on message icon
                            const target = e.target as HTMLElement;
                            if (target.closest(".message-icon")) {
                              handleStartConversation(friend._id);
                            } else {
                              router.push(`/profile?userId=${friend._id}`);
                            }
                          }}
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <Avatar className="h-8 w-8 flex-shrink-0">
                              <AvatarFallback
                                className={`text-xs font-semibold text-white ${
                                  i % 4 === 0
                                    ? "bg-gradient-to-br from-blue-400 to-cyan-500"
                                    : i % 4 === 1
                                    ? "bg-gradient-to-br from-purple-400 to-pink-500"
                                    : i % 4 === 2
                                    ? "bg-gradient-to-br from-orange-400 to-red-500"
                                    : "bg-gradient-to-br from-green-400 to-teal-500"
                                }`}
                              >
                                {friend.name
                                  ?.split(" ")
                                  .map((n: string) => n[0])
                                  .join("") ||
                                  friend.username?.charAt(0).toUpperCase() ||
                                  "U"}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-semibold text-cyan-900 truncate">
                              {friend.name || friend.username || "Unknown"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStartConversation(friend._id);
                              }}
                              className="message-icon opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-cyan-100"
                              title="Send message"
                            >
                              <MessageCircle className="h-4 w-4 text-cyan-600" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </aside>

          {/* Main Feed */}
          <main className="lg:col-span-6">
            {/* Story/Avatar Row */}
            <div className="mb-6 flex gap-3 overflow-x-auto pb-2">
              {[
                "Quinn",
                "Alex",
                "Sarah",
                "Sebastian",
                "Stacy",
                "Jose",
                "Alisa",
                "Andrew",
              ].map((name, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center gap-2 flex-shrink-0 cursor-pointer"
                >
                  <div
                    className={`rounded-full p-0.5 ${
                      i === 0
                        ? "bg-gradient-to-br from-cyan-400 to-blue-500"
                        : "bg-gray-200"
                    }`}
                  >
                    <Avatar className="h-14 w-14 border-2 border-white">
                      <AvatarFallback
                        className={`text-sm font-semibold text-white ${
                          i % 4 === 0
                            ? "bg-gradient-to-br from-blue-400 to-cyan-500"
                            : i % 4 === 1
                            ? "bg-gradient-to-br from-purple-400 to-pink-500"
                            : i % 4 === 2
                            ? "bg-gradient-to-br from-orange-400 to-red-500"
                            : "bg-gradient-to-br from-green-400 to-teal-500"
                        }`}
                      >
                        {name[0]}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <span className="text-xs font-semibold text-cyan-700">
                    {name}
                  </span>
                </div>
              ))}
            </div>

            {/* Create Post */}
            <Card className="mb-6 border-0 bg-white shadow-lg">
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <Avatar className="h-11 w-11">
                    <AvatarFallback className="bg-gradient-to-br from-cyan-400 to-blue-500 text-white">
                      {user?.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Textarea
                      placeholder="What's on your mind?"
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value)}
                      className="min-h-[60px] resize-none border-0 p-0 text-sm text-cyan-900 placeholder:text-cyan-400 focus-visible:ring-0"
                    />
                  </div>
                </div>

                {/* Selected Files Preview */}
                {selectedFiles.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="relative">
                        {file.type.startsWith("image/") ? (
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${index + 1}`}
                            className="h-20 w-20 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-gray-200">
                            <Video className="h-8 w-8 text-gray-500" />
                          </div>
                        )}
                        <button
                          onClick={() => removeFile(index)}
                          className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-3 flex items-center justify-between border-t border-cyan-100 pt-3">
                  <div className="flex gap-1">
                    <label htmlFor="file-upload">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="gap-2 text-cyan-600 hover:bg-cyan-50 hover:text-cyan-700 cursor-pointer"
                        asChild
                      >
                        <span>
                          <ImageIcon className="h-5 w-5" />
                          <span className="hidden sm:inline text-sm font-medium">
                            Photo
                          </span>
                        </span>
                      </Button>
                    </label>
                    <input
                      id="file-upload"
                      type="file"
                      multiple
                      accept="image/*,video/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2 text-pink-600 hover:bg-pink-50 hover:text-pink-700"
                    >
                      <Smile className="h-5 w-5" />
                      <span className="hidden sm:inline text-sm">Feeling</span>
                    </Button>
                  </div>
                  <Button
                    onClick={handleCreatePost}
                    disabled={
                      (!postContent.trim() && selectedFiles.length === 0) ||
                      isLoading
                    }
                    className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-6 font-medium text-white hover:shadow-lg disabled:opacity-50"
                    size="sm"
                  >
                    {isLoading
                      ? uploadingMedia
                        ? "Uploading..."
                        : "Posting..."
                      : "Post"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Posts */}
            <div className="space-y-4">
              {posts.length === 0 ? (
                <Card className="border-0 bg-white shadow-lg">
                  <CardContent className="py-16 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-cyan-100 to-blue-100">
                      <MessageCircle className="h-8 w-8 text-cyan-600" />
                    </div>
                    <h3 className="mb-2 text-lg font-bold text-cyan-900">
                      No posts yet
                    </h3>
                    <p className="text-sm text-cyan-600">
                      Be the first to share something with your network!
                    </p>
                  </CardContent>
                </Card>
              ) : (
                posts.map((post) => (
                  <Card
                    key={post._id}
                    className="border-0 bg-white shadow-lg transition-all hover:shadow-xl hover:-translate-y-1"
                  >
                    <CardContent className="p-5">
                      {/* Post Header */}
                      <div className="mb-4 flex items-start justify-between">
                        <div className="flex gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-gradient-to-br from-cyan-400 to-blue-500 text-white font-semibold">
                              {post.author.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-cyan-900">
                                {post.author.name}
                              </h4>
                              <Badge
                                variant="secondary"
                                className="rounded-full bg-gradient-to-r from-cyan-100 to-blue-100 px-2 py-0 text-xs font-semibold text-cyan-700"
                              >
                                {post.author.username}
                              </Badge>
                            </div>
                            <p className="flex items-center gap-1 text-xs text-cyan-500">
                              <Clock className="h-3 w-3" />
                              {formatTimeAgo(post.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {user?._id === post.author._id && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeletePost(post._id)}
                              className="h-8 w-8 text-cyan-400 hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-cyan-400 hover:bg-cyan-50"
                          >
                            <MoreHorizontal className="h-5 w-5" />
                          </Button>
                        </div>
                      </div>

                      {/* Post Content */}
                      {post.content && (
                        <p className="mb-4 text-sm leading-relaxed text-cyan-900 whitespace-pre-wrap">
                          {post.content}
                        </p>
                      )}

                      {/* Post Media */}
                      {post.images && post.images.length > 0 && (
                        <div className="mb-4 grid gap-2">
                          {post.images.map((imageUrl, idx) => {
                            const isVideo =
                              imageUrl.includes("video") ||
                              imageUrl.endsWith(".mp4") ||
                              imageUrl.endsWith(".mov");
                            return (
                              <div
                                key={idx}
                                className="overflow-hidden rounded-lg"
                              >
                                {isVideo ? (
                                  <video
                                    src={imageUrl}
                                    controls
                                    className="w-full max-h-96 object-contain bg-gray-100"
                                  />
                                ) : (
                                  <img
                                    src={imageUrl}
                                    alt={`Post media ${idx + 1}`}
                                    className="w-full max-h-96 object-contain rounded-lg bg-gray-100"
                                  />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Post Stats */}
                      <div className="mb-3 flex items-center justify-between text-xs text-cyan-600 font-medium">
                        <div className="flex items-center gap-1">
                          <div className="flex -space-x-1">
                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500">
                              <Heart className="h-3 w-3 fill-white text-white" />
                            </div>
                          </div>
                          <span>{post.likes.length} likes</span>
                        </div>
                        <span>
                          {Array.isArray(post.comments)
                            ? post.comments.length
                            : 0}{" "}
                          comments
                        </span>
                      </div>

                      {/* Post Actions */}
                      <div className="flex items-center gap-2 border-t border-cyan-100 pt-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleLikePost(post._id)}
                          className={`flex-1 gap-2 ${
                            post.likes.some(
                              (likeId) =>
                                likeId.toString() === user?._id?.toString()
                            )
                              ? "text-red-500 hover:bg-red-50 hover:text-red-600"
                              : "text-cyan-600 hover:bg-red-50 hover:text-red-500"
                          }`}
                        >
                          <Heart
                            className={`h-5 w-5 ${
                              post.likes.some(
                                (likeId) =>
                                  likeId.toString() === user?._id?.toString()
                              )
                                ? "fill-current"
                                : ""
                            }`}
                          />
                          <span className="text-sm font-medium">Like</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newExpanded = new Set(expandedComments);
                            if (newExpanded.has(post._id)) {
                              newExpanded.delete(post._id);
                            } else {
                              newExpanded.add(post._id);
                            }
                            setExpandedComments(newExpanded);
                          }}
                          className="flex-1 gap-2 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                        >
                          <MessageCircle className="h-5 w-5" />
                          <span className="text-sm font-medium">Comment</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex-1 gap-2 text-purple-600 hover:bg-purple-50 hover:text-purple-700"
                        >
                          <Share2 className="h-5 w-5" />
                          <span className="text-sm font-medium">Share</span>
                        </Button>
                      </div>

                      {/* Comments Section */}
                      {expandedComments.has(post._id) && (
                        <div className="mt-4 border-t border-cyan-100 pt-4">
                          <CommentSection postId={post._id} />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </main>

          {/* Right Sidebar */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-20 space-y-4">
              {/* Live Updates / Featured */}
              <Card className="overflow-hidden border-0 bg-white shadow-lg">
                <div className="relative">
                  <Badge className="absolute left-3 top-3 rounded-md bg-gradient-to-r from-red-500 to-pink-500 px-2 py-1 text-xs font-semibold">
                    LIVE · 9534
                  </Badge>
                  <img
                    src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=250&fit=crop"
                    alt="Live stream"
                    className="h-48 w-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                    <p className="text-sm font-semibold text-white">
                      How to create Youtube subscriber grow faster
                    </p>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-gradient-to-br from-yellow-400 to-orange-500 text-xs font-semibold text-white">
                        JD
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-cyan-900">
                        James Anderson
                      </p>
                      <p className="flex items-center gap-1 text-xs text-cyan-500">
                        <Clock className="h-3 w-3" />
                        23 minutes ago
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Activity Feed */}
              <Card className="border-0 bg-white shadow-lg">
                <CardContent className="p-4">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-gradient-to-br from-blue-400 to-cyan-500 text-xs font-semibold text-white">
                          AC
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm text-cyan-800">
                          <span className="font-bold text-cyan-900">
                            Aron Cooper
                          </span>{" "}
                          left 6 comments on{" "}
                          <span className="font-bold text-cyan-600">
                            Anywhere Video
                          </span>
                        </p>
                        <p className="mt-1 text-xs text-cyan-500">
                          53 minutes ago
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-gradient-to-br from-purple-400 to-pink-500 text-xs font-semibold text-white">
                          KB
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm text-cyan-800">
                          <span className="font-bold text-cyan-900">
                            Kiran Bator
                          </span>{" "}
                          posted in{" "}
                          <span className="font-bold text-cyan-600">
                            Design Thinking
                          </span>
                        </p>
                        <p className="mt-1 text-xs text-cyan-500">
                          55 minutes ago
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-gradient-to-br from-green-400 to-teal-500 text-xs font-semibold text-white">
                          JD
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm text-cyan-800">
                          <span className="font-bold text-cyan-900">
                            John Doe
                          </span>{" "}
                          reacted to your comment here 😍
                        </p>
                        <p className="mt-1 text-xs text-cyan-500">1 hour ago</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-gradient-to-br from-orange-400 to-red-500 text-xs font-semibold text-white">
                          SP
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm text-cyan-800">
                          <span className="font-bold text-cyan-900">
                            Stacey Patel
                          </span>{" "}
                          commented: @you Which ones
                        </p>
                        <p className="mt-1 text-xs text-cyan-500">
                          2 hours ago
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-gradient-to-br from-pink-400 to-rose-500 text-xs font-semibold text-white">
                          SH
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm text-cyan-800">
                          <span className="font-bold text-cyan-900">
                            Sarah Harding
                          </span>{" "}
                          shared{" "}
                          <span className="font-bold text-cyan-600">
                            Tips and Tricks
                          </span>
                        </p>
                        <p className="mt-1 text-xs text-cyan-500">
                          3 hours ago
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Add Comment */}
              <Card className="border-0 bg-white shadow-lg">
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-gradient-to-br from-cyan-400 to-blue-500 text-white">
                        {user?.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-1 items-center gap-2 rounded-full bg-gradient-to-r from-cyan-50 to-blue-50 px-4">
                      <input
                        type="text"
                        placeholder="Add your comment"
                        className="flex-1 bg-transparent text-sm text-cyan-900 outline-none placeholder:text-cyan-400"
                      />
                      <Button
                        size="icon"
                        className="h-8 w-8 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                      >
                        <Send className="h-4 w-4 text-white" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
