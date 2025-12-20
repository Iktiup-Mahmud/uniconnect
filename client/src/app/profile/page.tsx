"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Edit, Save, X, Trash2, ArrowLeft } from "lucide-react";
import { Post, User as UserType } from "@/types";
import { api } from "@/lib/api";
import { toast } from "sonner";

export default function ProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<UserType | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingPost, setIsEditingPost] = useState<string | null>(null);
  const [isOwnProfile, setIsOwnProfile] = useState(true);
  const [editProfileData, setEditProfileData] = useState({
    name: "",
    bio: "",
    avatar: "",
  });
  const [editPostData, setEditPostData] = useState<{
    content: string;
    images: string[];
  }>({ content: "", images: [] });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    const userId = searchParams.get("userId");
    if (userId) {
      fetchUserProfile(userId);
      fetchUserPosts(userId);
      setIsOwnProfile(false);
    } else {
      fetchProfile();
      fetchUserPosts();
      setIsOwnProfile(true);
    }
  }, [router, searchParams]);

  const fetchProfile = async () => {
    try {
      const response = await api.getProfile();
      if (response.success && response.data) {
        const userData = response.data.user;
        setUser(userData);
        setEditProfileData({
          name: userData.name || "",
          bio: userData.bio || "",
          avatar: userData.avatar || "",
        });
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to load profile");
    }
  };

  const fetchUserProfile = async (userId: string) => {
    try {
      const response = await api.getUser(userId);
      if (response.success && response.data) {
        const userData = response.data.user;
        setUser(userData);
        setEditProfileData({
          name: userData.name || "",
          bio: userData.bio || "",
          avatar: userData.avatar || "",
        });
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to load profile");
    }
  };

  const fetchUserPosts = async (userId?: string) => {
    try {
      const response = await api.getUserPosts(userId);
      if (response.success && response.data) {
        setPosts(response.data.posts || []);
      }
    } catch (error: any) {
      console.error("Error fetching posts:", error);
    }
  };

  const handleUpdateProfile = async () => {
    setIsLoading(true);
    try {
      const response = await api.updateProfile(editProfileData);
      if (response.success && response.data) {
        setUser(response.data.user);
        setIsEditingProfile(false);
        toast.success("Profile updated successfully");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePost = async (postId: string) => {
    setIsLoading(true);
    try {
      const response = await api.updatePost(postId, editPostData);
      if (response.success && response.data) {
        setPosts((prev) =>
          prev.map((p) => (p._id === postId ? response.data.post : p))
        );
        setIsEditingPost(null);
        toast.success("Post updated successfully");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update post");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    setIsLoading(true);
    try {
      const response = await api.deletePost(postId);
      if (response.success) {
        setPosts((prev) => prev.filter((p) => p._id !== postId));
        toast.success("Post deleted successfully");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to delete post");
    } finally {
      setIsLoading(false);
    }
  };

  const startEditingPost = (post: Post) => {
    setIsEditingPost(post._id);
    setEditPostData({
      content: post.content || "",
      images: post.images || [],
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard")}
            className="mb-4 rounded-xl border-gray-300 bg-white hover:bg-gray-50 text-gray-700 shadow-sm"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>

        {/* Profile Card */}
        <Card className="mb-6 rounded-2xl border border-gray-200 bg-white shadow-sm">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>
                    {user.name?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-2xl text-gray-500">
                    {user.name}
                  </CardTitle>
                  <p className="text-gray-500">@{user.username}</p>
                  {user.bio && <p className="mt-2 text-gray-700">{user.bio}</p>}
                  <Badge className="mt-2">{user.role || "student"}</Badge>
                </div>
              </div>
              {isOwnProfile && (
                <Button
                  variant="outline"
                  onClick={() => setIsEditingProfile(!isEditingProfile)}
                  className="rounded-xl border-gray-300 hover:bg-gray-50"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  {isEditingProfile ? "Cancel" : "Edit Profile"}
                </Button>
              )}
            </div>
          </CardHeader>

          {isEditingProfile && (
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Name</label>
                <Input
                  value={editProfileData.name}
                  onChange={(e) =>
                    setEditProfileData({
                      ...editProfileData,
                      name: e.target.value,
                    })
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Bio</label>
                <Textarea
                  value={editProfileData.bio}
                  onChange={(e) =>
                    setEditProfileData({
                      ...editProfileData,
                      bio: e.target.value,
                    })
                  }
                  className="mt-1"
                  rows={3}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Avatar URL</label>
                <Input
                  value={editProfileData.avatar}
                  onChange={(e) =>
                    setEditProfileData({
                      ...editProfileData,
                      avatar: e.target.value,
                    })
                  }
                  className="mt-1"
                  placeholder="https://..."
                />
              </div>
              <Button
                onClick={handleUpdateProfile}
                disabled={isLoading}
                className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/40"
              >
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </CardContent>
          )}
        </Card>

        {/* Posts Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">
            {isOwnProfile ? "My Posts" : "Posts"}
          </h2>
          {posts.length === 0 ? (
            <Card className="rounded-2xl border border-gray-200 bg-white shadow-sm">
              <CardContent className="py-8 text-center text-gray-500">
                No posts yet. Create your first post from the dashboard!
              </CardContent>
            </Card>
          ) : (
            posts.map((post) => (
              <Card
                key={post._id}
                className="rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                <CardContent className="pt-6">
                  {isEditingPost === post._id ? (
                    <div className="space-y-4">
                      <Textarea
                        value={editPostData.content}
                        onChange={(e) =>
                          setEditPostData({
                            ...editPostData,
                            content: e.target.value,
                          })
                        }
                        rows={4}
                      />
                      {editPostData.images &&
                        editPostData.images.length > 0 && (
                          <div className="grid grid-cols-2 gap-2">
                            {editPostData.images.map((img, idx) => (
                              <div key={idx} className="relative">
                                <img
                                  src={img}
                                  alt={`Media ${idx + 1}`}
                                  className="w-full h-32 object-cover rounded-xl"
                                />
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  className="absolute top-1 right-1"
                                  onClick={() => {
                                    setEditPostData({
                                      ...editPostData,
                                      images: editPostData.images.filter(
                                        (_, i) => i !== idx
                                      ),
                                    });
                                  }}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleUpdatePost(post._id)}
                          disabled={isLoading}
                          className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/40"
                        >
                          <Save className="mr-2 h-4 w-4" />
                          Save
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setIsEditingPost(null)}
                          className="rounded-xl border-gray-300 hover:bg-gray-50"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Avatar>
                            <AvatarImage
                              src={
                                typeof post.author === "object"
                                  ? post.author.avatar
                                  : ""
                              }
                            />
                            <AvatarFallback>
                              {typeof post.author === "object"
                                ? post.author.name?.charAt(0).toUpperCase()
                                : "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold">
                              {typeof post.author === "object"
                                ? post.author.name
                                : "Unknown"}
                            </p>
                            <p className="text-sm text-gray-500">
                              {new Date(post.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        {isOwnProfile && (
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => startEditingPost(post)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeletePost(post._id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        )}
                      </div>
                      {post.content && (
                        <p className="mb-4 whitespace-pre-wrap">
                          {post.content}
                        </p>
                      )}
                      {post.images && post.images.length > 0 && (
                        <div className="grid grid-cols-2 gap-2 mb-4">
                          {post.images.map((img, idx) => (
                            <img
                              key={idx}
                              src={img}
                              alt={`Post media ${idx + 1}`}
                              className="w-full h-48 object-cover rounded-xl"
                            />
                          ))}
                        </div>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>{post.likes?.length || 0} likes</span>
                        <span>{post.comments?.length || 0} comments</span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
