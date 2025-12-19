"use client";

import { useEffect, useState } from "react";
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
  Bookmark,
  Home,
  Compass,
  Calendar,
  Settings
} from "lucide-react";
import { Post, User } from "@/types";
import { api } from "@/lib/api";

export default function DashboardPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [postContent, setPostContent] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchPosts = async () => {
    try {
      const response = await api.getPosts();
      if (response.success) {
        setPosts(response.data.posts || []);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
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
    }
  }, [router]);

  const handleCreatePost = async () => {
    if (!postContent.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const response = await api.createPost(postContent);
      if (response.success) {
        setPostContent("");
        fetchPosts();
      }
    } catch (error) {
      console.error("Error creating post:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLikePost = async (postId: string) => {
    try {
      await api.likePost(postId);
      fetchPosts();
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    
    try {
      await api.deletePost(postId);
      fetchPosts();
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
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
            <span className="text-xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">UniConnect</span>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-cyan-400" />
              <Input
                type="text"
                placeholder="Search"
                className="h-11 w-full rounded-xl border-cyan-200 bg-gradient-to-r from-cyan-50 to-blue-50 pl-12 focus:border-cyan-400 focus:bg-white focus:ring-2 focus:ring-cyan-200"
              />
            </div>
          </div>

          {/* Top Nav Icons */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative rounded-xl text-cyan-600 hover:bg-cyan-50">
              <Home className="h-6 w-6" />
            </Button>
            <Button variant="ghost" size="icon" className="relative rounded-xl text-purple-600 hover:bg-purple-50">
              <Compass className="h-6 w-6" />
            </Button>
            <Button variant="ghost" size="icon" className="relative rounded-xl text-blue-600 hover:bg-blue-50">
              <Calendar className="h-6 w-6" />
            </Button>
            <Button variant="ghost" size="icon" className="relative rounded-xl text-pink-600 hover:bg-pink-50">
              <Settings className="h-6 w-6" />
            </Button>
            <Button variant="ghost" size="icon" className="relative rounded-xl text-orange-600 hover:bg-orange-50">
              <Bell className="h-6 w-6" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
            </Button>
            <div className="ml-2 flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-100 to-blue-100 px-3 py-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-sm font-semibold text-white">
                  {user?.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <span className="hidden text-sm font-semibold text-cyan-700 lg:block">{user?.name?.split(" ")[0] || "User"}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout} className="rounded-xl text-cyan-600 hover:bg-cyan-50">
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
              {/* Your Groups */}
              <Card className="overflow-hidden border-0 bg-white shadow-lg">
                <CardContent className="p-4">
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-cyan-600">Your Group</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50 cursor-pointer">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                      <span className="text-sm font-semibold text-cyan-900">Figma Community</span>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50 cursor-pointer">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-400 to-pink-500">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                      <span className="text-sm font-semibold text-cyan-900">Sketch Community</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Friends List */}
              <Card className="overflow-hidden border-0 bg-white shadow-lg">
                <CardContent className="p-4">
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-cyan-600">Friends</h3>
                  <div className="space-y-2">
                    {["Eleanor Pena", "Leslie Alexander", "Brooklyn Simmons", "Arlene McCoy", "Jerome Bell", "Darlene Robertson", "Kathryn Murphy", "Theresa Webb", "Darrell Steward"].map((name, i) => (
                      <div key={i} className="flex items-center justify-between rounded-lg p-2 transition-colors hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50 cursor-pointer">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className={`text-xs font-semibold text-white ${
                              i % 4 === 0 ? "bg-gradient-to-br from-blue-400 to-cyan-500" :
                              i % 4 === 1 ? "bg-gradient-to-br from-purple-400 to-pink-500" :
                              i % 4 === 2 ? "bg-gradient-to-br from-orange-400 to-red-500" :
                              "bg-gradient-to-br from-green-400 to-teal-500"
                            }`}>
                              {name.split(" ").map(n => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-semibold text-cyan-900">{name}</span>
                        </div>
                        {i % 3 === 0 && (
                          <span className="h-2 w-2 rounded-full bg-green-500"></span>
                        )}
                        {i === 0 && <span className="text-xs text-cyan-500">11 min</span>}
                        {i === 2 && <span className="text-xs text-cyan-500">9 min</span>}
                        {i === 7 && <span className="text-xs text-cyan-500">11 min</span>}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </aside>

          {/* Main Feed */}
          <main className="lg:col-span-6">
            {/* Story/Avatar Row */}
            <div className="mb-6 flex gap-3 overflow-x-auto pb-2">
              {["Quinn", "Alex", "Sarah", "Sebastian", "Stacy", "Jose", "Alisa", "Andrew"].map((name, i) => (
                <div key={i} className="flex flex-col items-center gap-2 flex-shrink-0 cursor-pointer">
                  <div className={`rounded-full p-0.5 ${i === 0 ? "bg-gradient-to-br from-cyan-400 to-blue-500" : "bg-gray-200"}`}>
                    <Avatar className="h-14 w-14 border-2 border-white">
                      <AvatarFallback className={`text-sm font-semibold text-white ${
                        i % 4 === 0 ? "bg-gradient-to-br from-blue-400 to-cyan-500" :
                        i % 4 === 1 ? "bg-gradient-to-br from-purple-400 to-pink-500" :
                        i % 4 === 2 ? "bg-gradient-to-br from-orange-400 to-red-500" :
                        "bg-gradient-to-br from-green-400 to-teal-500"
                      }`}>
                        {name[0]}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <span className="text-xs font-semibold text-cyan-700">{name}</span>
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
                <div className="mt-3 flex items-center justify-between border-t border-cyan-100 pt-3">
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" className="gap-2 text-cyan-600 hover:bg-cyan-50 hover:text-cyan-700">
                      <ImageIcon className="h-5 w-5" />
                      <span className="hidden sm:inline text-sm font-medium">Photo</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-2 text-purple-600 hover:bg-purple-50 hover:text-purple-700">
                      <Video className="h-5 w-5" />
                      <span className="hidden sm:inline text-sm font-medium">Video</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-2 text-pink-600 hover:bg-pink-50 hover:text-pink-700">
                      <Smile className="h-5 w-5" />
                      <span className="hidden sm:inline text-sm">Feeling</span>
                    </Button>
                  </div>
                  <Button
                    onClick={handleCreatePost}
                    disabled={!postContent.trim() || isLoading}
                    className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-6 font-medium text-white hover:shadow-lg disabled:opacity-50"
                    size="sm"
                  >
                    {isLoading ? "Posting..." : "Post"}
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
                    <h3 className="mb-2 text-lg font-bold text-cyan-900">No posts yet</h3>
                    <p className="text-sm text-cyan-600">
                      Be the first to share something with your network!
                    </p>
                  </CardContent>
                </Card>
              ) : (
                posts.map((post) => (
                  <Card key={post._id} className="border-0 bg-white shadow-lg transition-all hover:shadow-xl hover:-translate-y-1">
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
                              <h4 className="font-bold text-cyan-900">{post.author.name}</h4>
                              <Badge variant="secondary" className="rounded-full bg-gradient-to-r from-cyan-100 to-blue-100 px-2 py-0 text-xs font-semibold text-cyan-700">
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
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-cyan-400 hover:bg-cyan-50">
                            <MoreHorizontal className="h-5 w-5" />
                          </Button>
                        </div>
                      </div>

                      {/* Post Content */}
                      <p className="mb-4 text-sm leading-relaxed text-cyan-900 whitespace-pre-wrap">{post.content}</p>

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
                        <span>{post.comments.length} comments</span>
                      </div>

                      {/* Post Actions */}
                      <div className="flex items-center gap-2 border-t border-cyan-100 pt-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleLikePost(post._id)}
                          className={`flex-1 gap-2 ${
                            post.likes.includes(user?._id || "")
                              ? "text-red-500 hover:bg-red-50 hover:text-red-600"
                              : "text-cyan-600 hover:bg-red-50 hover:text-red-500"
                          }`}
                        >
                          <Heart
                            className={`h-5 w-5 ${
                              post.likes.includes(user?._id || "") ? "fill-current" : ""
                            }`}
                          />
                          <span className="text-sm font-medium">Like</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="flex-1 gap-2 text-blue-600 hover:bg-blue-50 hover:text-blue-700">
                          <MessageCircle className="h-5 w-5" />
                          <span className="text-sm font-medium">Comment</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="flex-1 gap-2 text-purple-600 hover:bg-purple-50 hover:text-purple-700">
                          <Share2 className="h-5 w-5" />
                          <span className="text-sm font-medium">Share</span>
                        </Button>
                      </div>
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
                    <p className="text-sm font-semibold text-white">How to create Youtube subscriber grow faster</p>
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
                      <p className="text-sm font-semibold text-cyan-900">James Anderson</p>
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
                          <span className="font-bold text-cyan-900">Aron Cooper</span> left 6 comments on{" "}
                          <span className="font-bold text-cyan-600">Anywhere Video</span>
                        </p>
                        <p className="mt-1 text-xs text-cyan-500">53 minutes ago</p>
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
                          <span className="font-bold text-cyan-900">Kiran Bator</span> posted in{" "}
                          <span className="font-bold text-cyan-600">Design Thinking</span>
                        </p>
                        <p className="mt-1 text-xs text-cyan-500">55 minutes ago</p>
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
                          <span className="font-bold text-cyan-900">John Doe</span> reacted to your comment here 😍
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
                          <span className="font-bold text-cyan-900">Stacey Patel</span> commented: @you Which ones
                        </p>
                        <p className="mt-1 text-xs text-cyan-500">2 hours ago</p>
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
                          <span className="font-bold text-cyan-900">Sarah Harding</span> shared{" "}
                          <span className="font-bold text-cyan-600">Tips and Tricks</span>
                        </p>
                        <p className="mt-1 text-xs text-cyan-500">3 hours ago</p>
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
                      <Button size="icon" className="h-8 w-8 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500">
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
