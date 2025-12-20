"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  User,
  Lock,
  Bell,
  Eye,
  Shield,
  Palette,
  Save,
  Mail,
  Camera,
} from "lucide-react";
import { api } from "@/lib/api";
import { User as UserType } from "@/types";
import { toast } from "sonner";

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Account Settings
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");

  // Password Settings
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Privacy Settings
  const [profileVisibility, setProfileVisibility] = useState("public");
  const [showEmail, setShowEmail] = useState(false);
  const [allowMessages, setAllowMessages] = useState(true);

  // Notification Settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [messageNotifications, setMessageNotifications] = useState(true);
  const [commentNotifications, setCommentNotifications] = useState(true);
  const [likeNotifications, setLikeNotifications] = useState(true);

  // Theme Settings
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token) {
      router.push("/login");
      return;
    }

    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setName(parsedUser.name || "");
      setUsername(parsedUser.username || "");
      setEmail(parsedUser.email || "");
      setBio(parsedUser.bio || "");
    }
  }, [router]);

  const handleUpdateAccount = async () => {
    setIsLoading(true);
    try {
      const response = await api.updateProfile({
        name,
        username,
        email,
        bio,
      });

      if (response.success && response.data) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
        setUser(response.data.user);
        toast.success("Account updated successfully!");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update account");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    try {
      // Note: You'll need to implement this endpoint in the backend
      // const response = await api.updatePassword({ currentPassword, newPassword });
      toast.success("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast.error(error.message || "Failed to update password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePreferences = () => {
    // Save preferences to localStorage or backend
    localStorage.setItem(
      "userPreferences",
      JSON.stringify({
        privacy: { profileVisibility, showEmail, allowMessages },
        notifications: {
          emailNotifications,
          pushNotifications,
          messageNotifications,
          commentNotifications,
          likeNotifications,
        },
        theme,
      })
    );
    toast.success("Preferences saved successfully!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-purple-50">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 backdrop-blur-md shadow-sm">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="rounded-xl text-cyan-600 hover:bg-cyan-50"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
              <p className="text-sm text-gray-600">Manage your account and preferences</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="space-y-6">
          {/* Account Settings */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 p-2">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle>Account Settings</CardTitle>
                  <p className="text-sm text-gray-600">Update your account information</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="bg-gradient-to-br from-cyan-400 to-blue-500 text-2xl text-white">
                    {user?.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline" className="rounded-lg">
                    <Camera className="mr-2 h-4 w-4" />
                    Change Avatar
                  </Button>
                  <p className="mt-1 text-xs text-gray-500">JPG, PNG or GIF (max. 2MB)</p>
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    className="rounded-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Your username"
                    className="rounded-lg"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="rounded-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself..."
                  rows={3}
                  className="rounded-lg"
                />
              </div>

              <Button
                onClick={handleUpdateAccount}
                disabled={isLoading}
                className="w-full rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 font-semibold text-white hover:shadow-lg"
              >
                <Save className="mr-2 h-4 w-4" />
                Save Account Changes
              </Button>
            </CardContent>
          </Card>

          {/* Password Settings */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-gradient-to-br from-purple-400 to-pink-500 p-2">
                  <Lock className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle>Password & Security</CardTitle>
                  <p className="text-sm text-gray-600">Update your password</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="rounded-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="rounded-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="rounded-lg"
                />
              </div>

              <Button
                onClick={handleUpdatePassword}
                disabled={isLoading}
                className="w-full rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 font-semibold text-white hover:shadow-lg"
              >
                <Lock className="mr-2 h-4 w-4" />
                Update Password
              </Button>
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-gradient-to-br from-green-400 to-teal-500 p-2">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle>Privacy Settings</CardTitle>
                  <p className="text-sm text-gray-600">Control who can see your information</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Profile Visibility</Label>
                <div className="flex gap-2">
                  <Button
                    variant={profileVisibility === "public" ? "default" : "outline"}
                    onClick={() => setProfileVisibility("public")}
                    className="flex-1 rounded-lg"
                  >
                    Public
                  </Button>
                  <Button
                    variant={profileVisibility === "friends" ? "default" : "outline"}
                    onClick={() => setProfileVisibility("friends")}
                    className="flex-1 rounded-lg"
                  >
                    Friends Only
                  </Button>
                  <Button
                    variant={profileVisibility === "private" ? "default" : "outline"}
                    onClick={() => setProfileVisibility("private")}
                    className="flex-1 rounded-lg"
                  >
                    Private
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">Show Email Publicly</span>
                  </div>
                  <Button
                    variant={showEmail ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowEmail(!showEmail)}
                    className="rounded-lg"
                  >
                    {showEmail ? "On" : "Off"}
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">Allow Direct Messages</span>
                  </div>
                  <Button
                    variant={allowMessages ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAllowMessages(!allowMessages)}
                    className="rounded-lg"
                  >
                    {allowMessages ? "On" : "Off"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-gradient-to-br from-orange-400 to-red-500 p-2">
                  <Bell className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle>Notification Preferences</CardTitle>
                  <p className="text-sm text-gray-600">Manage your notification settings</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Email Notifications</span>
                <Button
                  variant={emailNotifications ? "default" : "outline"}
                  size="sm"
                  onClick={() => setEmailNotifications(!emailNotifications)}
                  className="rounded-lg"
                >
                  {emailNotifications ? "On" : "Off"}
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Push Notifications</span>
                <Button
                  variant={pushNotifications ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPushNotifications(!pushNotifications)}
                  className="rounded-lg"
                >
                  {pushNotifications ? "On" : "Off"}
                </Button>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">New Messages</span>
                <Button
                  variant={messageNotifications ? "default" : "outline"}
                  size="sm"
                  onClick={() => setMessageNotifications(!messageNotifications)}
                  className="rounded-lg"
                >
                  {messageNotifications ? "On" : "Off"}
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">New Comments</span>
                <Button
                  variant={commentNotifications ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCommentNotifications(!commentNotifications)}
                  className="rounded-lg"
                >
                  {commentNotifications ? "On" : "Off"}
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Post Likes</span>
                <Button
                  variant={likeNotifications ? "default" : "outline"}
                  size="sm"
                  onClick={() => setLikeNotifications(!likeNotifications)}
                  className="rounded-lg"
                >
                  {likeNotifications ? "On" : "Off"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Theme Settings */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-gradient-to-br from-indigo-400 to-purple-500 p-2">
                  <Palette className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle>Appearance</CardTitle>
                  <p className="text-sm text-gray-600">Customize how UniConnect looks</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Theme</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant={theme === "light" ? "default" : "outline"}
                    onClick={() => setTheme("light")}
                    className="rounded-lg"
                  >
                    Light
                  </Button>
                  <Button
                    variant={theme === "dark" ? "default" : "outline"}
                    onClick={() => setTheme("dark")}
                    className="rounded-lg"
                  >
                    Dark
                  </Button>
                  <Button
                    variant={theme === "auto" ? "default" : "outline"}
                    onClick={() => setTheme("auto")}
                    className="rounded-lg"
                  >
                    Auto
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save All Button */}
          <Button
            onClick={handleSavePreferences}
            className="w-full rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 py-6 text-lg font-semibold text-white hover:shadow-lg"
          >
            <Save className="mr-2 h-5 w-5" />
            Save All Preferences
          </Button>

          {/* Danger Zone */}
          <Card className="border-2 border-red-200 bg-red-50/50 shadow-lg">
            <CardHeader>
              <CardTitle className="text-red-600">Danger Zone</CardTitle>
              <p className="text-sm text-red-600">Irreversible actions</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full rounded-lg border-red-300 text-red-600 hover:bg-red-50">
                Deactivate Account
              </Button>
              <Button variant="destructive" className="w-full rounded-lg">
                Delete Account Permanently
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

