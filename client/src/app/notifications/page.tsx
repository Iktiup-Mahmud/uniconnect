"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Bell,
  Heart,
  MessageCircle,
  UserPlus,
  Calendar,
  ArrowLeft,
  Check,
  Trash2,
} from "lucide-react";
import { Notification } from "@/types";
import { api } from "@/lib/api";
import { toast } from "sonner";

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    fetchNotifications();
  }, [router]);

  const fetchNotifications = async () => {
    try {
      const response = await api.getNotifications();
      if (response.success && response.data) {
        setNotifications(response.data.notifications || []);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    setIsLoading(true);
    try {
      const response = await api.markNotificationAsRead(notificationId);
      if (response.success) {
        fetchNotifications();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to mark as read");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    setIsLoading(true);
    try {
      const response = await api.markAllNotificationsAsRead();
      if (response.success) {
        toast.success("All notifications marked as read");
        fetchNotifications();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to mark all as read");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    setIsLoading(true);
    try {
      const response = await api.deleteNotification(notificationId);
      if (response.success) {
        toast.success("Notification deleted");
        fetchNotifications();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to delete notification");
    } finally {
      setIsLoading(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "like":
        return <Heart className="h-5 w-5 text-red-500" />;
      case "comment":
        return <MessageCircle className="h-5 w-5 text-blue-500" />;
      case "follow":
        return <UserPlus className="h-5 w-5 text-green-500" />;
      case "event":
        return <Calendar className="h-5 w-5 text-purple-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatTime = (date: string) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diff = now.getTime() - notificationDate.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return notificationDate.toLocaleDateString();
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
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
                  <Bell className="h-8 w-8 text-orange-600" />
                  Notifications
                </h1>
                {unreadCount > 0 && (
                  <p className="text-gray-600">
                    You have {unreadCount} unread notification
                    {unreadCount > 1 ? "s" : ""}
                  </p>
                )}
              </div>
            </div>
            {notifications.length > 0 && unreadCount > 0 && (
              <Button
                onClick={handleMarkAllAsRead}
                disabled={isLoading}
                className="rounded-xl"
              >
                <Check className="mr-2 h-4 w-4" />
                Mark all as read
              </Button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {notifications.length === 0 ? (
            <Card className="border-0 shadow-lg">
              <CardContent className="py-16 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-orange-100 to-yellow-100 mb-4">
                  <Bell className="h-10 w-10 text-orange-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  No notifications yet
                </h3>
                <p className="text-sm text-gray-600">
                  When you get notifications, they'll show up here
                </p>
              </CardContent>
            </Card>
          ) : (
            notifications.map((notification) => (
              <Card
                key={notification._id}
                className={`border-0 shadow-md transition-all hover:shadow-lg cursor-pointer ${
                  !notification.isRead
                    ? "bg-gradient-to-r from-orange-50 to-yellow-50 border-l-4 border-l-orange-500"
                    : "bg-white"
                }`}
                onClick={() => {
                  if (!notification.isRead) {
                    handleMarkAsRead(notification._id);
                  }
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-orange-100 to-yellow-100 flex items-center justify-center">
                        {getNotificationIcon(notification.type)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm mb-1 ${
                          !notification.isRead
                            ? "font-semibold text-gray-900"
                            : "text-gray-700"
                        }`}
                      >
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatTime(notification.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {!notification.isRead && (
                        <div className="h-2 w-2 rounded-full bg-orange-500"></div>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNotification(notification._id);
                        }}
                        disabled={isLoading}
                      >
                        <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-500" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

