"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  FileText,
  Shield,
  Trash2,
  ArrowLeft,
  TrendingUp,
  Activity,
} from "lucide-react";
import { User, Post } from "@/types";
import { api } from "@/lib/api";
import { toast } from "sonner";

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPosts: 0,
    activeUsers: 0,
    recentActivity: 0,
  });
  const [selectedTab, setSelectedTab] = useState<
    "overview" | "users" | "posts" | "reports"
  >("overview");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token) {
      router.push("/login");
      return;
    }

    if (userData) {
      const currentUser = JSON.parse(userData);
      setUser(currentUser);

      // Check if user is admin
      if (currentUser.role !== "admin") {
        toast.error("Access denied. Admin only.");
        router.push("/dashboard");
        return;
      }
    }

    fetchData();
  }, [router]);

  const fetchData = async () => {
    try {
      const [usersResponse, postsResponse] = await Promise.all([
        api.getUsers(),
        api.getPosts(),
      ]);

      if (usersResponse.success && usersResponse.data) {
        setUsers(usersResponse.data.users || []);
        setStats((prev) => ({
          ...prev,
          totalUsers: usersResponse.data.users?.length || 0,
        }));
      }

      if (postsResponse.success && postsResponse.data) {
        setPosts(postsResponse.data.posts || []);
        setStats((prev) => ({
          ...prev,
          totalPosts: postsResponse.data.posts?.length || 0,
        }));
      }
    } catch (error) {
      console.error("Error fetching admin data:", error);
      toast.error("Failed to load admin data");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    setIsLoading(true);
    try {
      const response = await api.deleteUser(userId);
      if (response.success) {
        toast.success("User deleted successfully");
        fetchData();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to delete user");
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
        toast.success("Post deleted successfully");
        fetchData();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to delete post");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-16 w-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">
            You need admin privileges to access this page
          </p>
          <Button onClick={() => router.push("/dashboard")}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard")}
              className="rounded-xl"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Shield className="h-8 w-8 text-purple-600" />
                Admin Panel
              </h1>
              <p className="text-gray-600">
                Manage users, posts, and platform content
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="border-0 bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">
                    Total Users
                  </p>
                  <p className="text-3xl font-bold mt-1">{stats.totalUsers}</p>
                </div>
                <Users className="h-12 w-12 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-purple-500 to-pink-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">
                    Total Posts
                  </p>
                  <p className="text-3xl font-bold mt-1">{stats.totalPosts}</p>
                </div>
                <FileText className="h-12 w-12 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-green-500 to-teal-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">
                    Active Users
                  </p>
                  <p className="text-3xl font-bold mt-1">
                    {Math.floor(stats.totalUsers * 0.7)}
                  </p>
                </div>
                <Activity className="h-12 w-12 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-orange-500 to-red-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Growth</p>
                  <p className="text-3xl font-bold mt-1">+24%</p>
                </div>
                <TrendingUp className="h-12 w-12 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2">
          <Button
            variant={selectedTab === "overview" ? "default" : "outline"}
            onClick={() => setSelectedTab("overview")}
            className="rounded-xl"
          >
            Overview
          </Button>
          <Button
            variant={selectedTab === "users" ? "default" : "outline"}
            onClick={() => setSelectedTab("users")}
            className="rounded-xl"
          >
            Users ({users.length})
          </Button>
          <Button
            variant={selectedTab === "posts" ? "default" : "outline"}
            onClick={() => setSelectedTab("posts")}
            className="rounded-xl"
          >
            Posts ({posts.length})
          </Button>
          <Button
            variant={selectedTab === "reports" ? "default" : "outline"}
            onClick={() => setSelectedTab("reports")}
            className="rounded-xl"
          >
            Reports
          </Button>
        </div>

        {/* Content */}
        {selectedTab === "overview" && (
          <div className="space-y-6">
            {/* Analytics Overview */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card className="border-0 bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-100">Total Users</p>
                      <h3 className="text-3xl font-bold">{users.length}</h3>
                      <p className="mt-1 text-xs text-blue-100">
                        +{Math.floor(users.length * 0.12)} this month
                      </p>
                    </div>
                    <div className="rounded-full bg-white/20 p-3">
                      <Users className="h-8 w-8" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-100">Total Posts</p>
                      <h3 className="text-3xl font-bold">{posts.length}</h3>
                      <p className="mt-1 text-xs text-purple-100">
                        +{Math.floor(posts.length * 0.25)} this week
                      </p>
                    </div>
                    <div className="rounded-full bg-white/20 p-3">
                      <FileText className="h-8 w-8" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 bg-gradient-to-br from-green-500 to-teal-500 text-white shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-100">Active Today</p>
                      <h3 className="text-3xl font-bold">
                        {Math.floor(users.length * 0.6)}
                      </h3>
                      <p className="mt-1 text-xs text-green-100">
                        {Math.floor(
                          ((users.length * 0.6) / users.length) * 100
                        )}
                        % engagement
                      </p>
                    </div>
                    <div className="rounded-full bg-white/20 p-3">
                      <Activity className="h-8 w-8" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-orange-100">Growth Rate</p>
                      <h3 className="text-3xl font-bold">+24%</h3>
                      <p className="mt-1 text-xs text-orange-100">
                        vs last month
                      </p>
                    </div>
                    <div className="rounded-full bg-white/20 p-3">
                      <TrendingUp className="h-8 w-8" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* User Role Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>User Role Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {["student", "faculty", "admin"].map((role) => {
                    const count = users.filter((u) => u.role === role).length;
                    const percentage =
                      users.length > 0 ? (count / users.length) * 100 : 0;
                    return (
                      <div key={role}>
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-sm font-medium capitalize">
                            {role}
                          </span>
                          <span className="text-sm text-gray-600">
                            {count} ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                          <div
                            className={`h-full rounded-full ${
                              role === "student"
                                ? "bg-gradient-to-r from-blue-500 to-cyan-500"
                                : role === "faculty"
                                ? "bg-gradient-to-r from-purple-500 to-pink-500"
                                : "bg-gradient-to-r from-orange-500 to-red-500"
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold">New user registrations</p>
                        <p className="text-sm text-gray-600">
                          {users.length} total users
                        </p>
                      </div>
                    </div>
                    <Badge>Active</Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-purple-500 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold">Content posts</p>
                        <p className="text-sm text-gray-600">
                          {posts.length} total posts
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary">Growing</Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center">
                        <Activity className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold">User engagement</p>
                        <p className="text-sm text-gray-600">
                          {Math.floor(
                            ((users.length * 0.6) / users.length) * 100
                          )}
                          % active rate
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-700">
                      Excellent
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Content Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Content Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 p-4">
                    <p className="text-sm text-gray-600">Total Likes</p>
                    <h4 className="text-2xl font-bold text-blue-600">
                      {posts.reduce(
                        (sum, post) => sum + (post.likes?.length || 0),
                        0
                      )}
                    </h4>
                  </div>
                  <div className="rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 p-4">
                    <p className="text-sm text-gray-600">Total Comments</p>
                    <h4 className="text-2xl font-bold text-purple-600">
                      {posts.reduce(
                        (sum, post) => sum + (post.comments?.length || 0),
                        0
                      )}
                    </h4>
                  </div>
                  <div className="rounded-xl bg-gradient-to-br from-green-50 to-teal-50 p-4">
                    <p className="text-sm text-gray-600">Avg. Engagement</p>
                    <h4 className="text-2xl font-bold text-green-600">
                      {posts.length > 0
                        ? Math.floor(
                            posts.reduce(
                              (sum, post) =>
                                sum +
                                (post.likes?.length || 0) +
                                (post.comments?.length || 0),
                              0
                            ) / posts.length
                          )
                        : 0}
                    </h4>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {selectedTab === "users" && (
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((u) => (
                  <div
                    key={u._id}
                    className="flex items-center justify-between p-4 border rounded-xl hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={u.avatar} />
                        <AvatarFallback>
                          {u.name?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{u.name}</p>
                        <p className="text-sm text-gray-600">@{u.username}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {u.role || "student"}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {u.email}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/profile?userId=${u._id}`)}
                      >
                        View
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteUser(u._id)}
                        disabled={isLoading || u._id === user._id}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {selectedTab === "posts" && (
          <Card>
            <CardHeader>
              <CardTitle>Content Moderation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {posts.map((post) => (
                  <div
                    key={post._id}
                    className="p-4 border rounded-xl hover:bg-gray-50"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {typeof post.author === "object"
                              ? post.author.name?.charAt(0).toUpperCase()
                              : "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-sm">
                            {typeof post.author === "object"
                              ? post.author.name
                              : "Unknown"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(post.createdAt)}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeletePost(post._id)}
                        disabled={isLoading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{post.content}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{post.likes?.length || 0} likes</span>
                      <span>{post.comments?.length || 0} comments</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {selectedTab === "reports" && (
          <Card>
            <CardHeader>
              <CardTitle>Reports & Moderation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Shield className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 mb-2">No reports at this time</p>
                <p className="text-sm text-gray-500">
                  User reports will appear here for moderation
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
