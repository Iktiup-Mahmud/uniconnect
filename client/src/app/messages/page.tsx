"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, Search, UserPlus, MessageCircle } from "lucide-react";
import { Conversation, Message, User } from "@/types";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { io, Socket } from "socket.io-client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function MessagesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [searchUsers, setSearchUsers] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [searchingUsers, setSearchingUsers] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const selectedConversationRef = useRef<Conversation | null>(null);

  // Keep ref in sync with state
  useEffect(() => {
    selectedConversationRef.current = selectedConversation;
  }, [selectedConversation]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    // Initialize Socket.io connection
    const socketUrl =
      process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") ||
      "http://localhost:5001";
    const newSocket = io(socketUrl, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    // Set initial connection state
    setIsConnected(newSocket.connected);

    newSocket.on("connect", () => {
      console.log("✅ Connected to Socket.io");
      console.log("  - Socket ID:", newSocket.id);
      console.log("  - Transport:", newSocket.io.engine.transport.name);
      console.log("  - Connected:", newSocket.connected);
      setIsConnected(true);

      // If a conversation is already selected, join its room immediately
      if (selectedConversationRef.current) {
        const conversationId = selectedConversationRef.current._id;
        console.log(
          "📥 Auto-joining conversation room on connect:",
          conversationId
        );
        newSocket.emit("join_conversation", conversationId);
        console.log("✅ Join emit sent");
      }
    });

    newSocket.on("disconnect", (reason) => {
      console.log("❌ Disconnected from Socket.io, reason:", reason);
      setIsConnected(false);
    });

    newSocket.on("connect_error", (error) => {
      console.error("❌ Socket connection error:", error.message);
      setIsConnected(false);
    });

    // Listen for authentication errors
    newSocket.on("error", (error) => {
      console.error("❌ Socket error:", error);
    });

    // Listen for new messages in any conversation
    const handleNewMessage = (data: {
      conversationId: string;
      message: Message;
    }) => {
      console.log("🔔 NEW_MESSAGE event received:", {
        conversationId: data.conversationId,
        messageId: data.message._id,
        content: data.message.content?.substring(0, 50),
      });

      // Check if this conversation is currently selected using ref
      const current = selectedConversationRef.current;
      console.log("Current conversation:", current?._id);

      if (current?._id === data.conversationId) {
        console.log("✅ Message is for current conversation");
        setMessages((prev) => {
          // Check if message already exists to avoid duplicates
          const exists = prev.some((m) => m._id === data.message._id);
          if (exists) {
            console.log("⚠️ Message already exists, skipping");
            return prev;
          }
          console.log("➕ Adding new message to state via socket");
          return [...prev, data.message];
        });
      } else {
        console.log("⚠️ Message is for a different conversation");
      }

      // Always refresh conversations to update last message (after a short delay)
      setTimeout(() => {
        fetchConversations();
      }, 100);
    };

    newSocket.on("new_message", handleNewMessage);

    // Test if socket is receiving any events
    newSocket.onAny((eventName, ...args) => {
      console.log(`📡 Socket event received: ${eventName}`, args);
    });

    // Listen for message notifications (for other conversations)
    const handleNotification = (data: {
      conversationId: string;
      message: Message;
    }) => {
      console.log("Message notification received:", data);

      const current = selectedConversationRef.current;
      // Only show notification if conversation is not currently selected
      if (current?._id !== data.conversationId) {
        toast.info("New message received");
      } else {
        // If the conversation is currently selected, add the message
        setMessages((prev) => {
          const exists = prev.some((m) => m._id === data.message._id);
          if (exists) return prev;
          return [...prev, data.message];
        });
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
      fetchConversations();
    };

    newSocket.on("message_notification", handleNotification);

    setSocket(newSocket);

    // Fetch conversations after socket is set up
    fetchConversations();

    return () => {
      newSocket.off("new_message", handleNewMessage);
      newSocket.off("message_notification", handleNotification);
      newSocket.off("connect");
      newSocket.off("disconnect");
      newSocket.off("connect_error");
      newSocket.off("error");
      newSocket.close();
    };
  }, [router]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (selectedConversation && socket) {
      const conversationId = selectedConversation._id;

      // Join room when conversation is selected
      const joinRoom = () => {
        if (socket.connected) {
          console.log("📥 Emitting join_conversation for:", conversationId);
          socket.emit("join_conversation", conversationId);

          // Verify it was sent
          setTimeout(() => {
            console.log(
              "✅ Join request sent. Socket connected:",
              socket.connected
            );
          }, 100);
        } else {
          console.log("⚠️ Socket not connected, waiting...");
          // If not connected yet, wait for connection then join
          const onConnect = () => {
            console.log(
              "📥 Joining conversation room after connect:",
              conversationId
            );
            socket.emit("join_conversation", conversationId);
            socket.off("connect", onConnect);
          };
          socket.on("connect", onConnect);
        }
      };

      joinRoom();

      // Always fetch messages when conversation is selected
      fetchMessages(conversationId);

      return () => {
        if (socket && socket.connected) {
          console.log("📤 Leaving conversation room:", conversationId);
          socket.emit("leave_conversation", conversationId);
        }
      };
    }
  }, [selectedConversation?._id, socket, isConnected]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [messages.length]);

  const fetchConversations = async () => {
    try {
      const response = await api.getConversations();
      if (response.success && response.data) {
        const conversationsList = response.data.conversations || [];
        setConversations(conversationsList);

        // Auto-select conversation from query parameter
        const conversationId = searchParams.get("conversationId");
        if (conversationId && !selectedConversation) {
          const conv = conversationsList.find(
            (c: Conversation) => c._id === conversationId
          );
          if (conv) {
            setSelectedConversation(conv);
          }
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to load conversations");
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const response = await api.getConversation(conversationId);
      if (response.success && response.data) {
        setMessages(response.data.messages || []);
        // Scroll to bottom after loading messages
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to load messages");
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConversation || isLoading) return;

    setIsLoading(true);
    const tempMessage = messageText.trim();
    const conversationId = selectedConversation._id;
    setMessageText("");

    // Create temporary message ID for optimistic update
    const tempId = `temp-${Date.now()}`;
    const userData = localStorage.getItem("user");
    const currentUser = userData ? JSON.parse(userData) : null;

    // Optimistic update - add message immediately
    const optimisticMessage: Message = {
      _id: tempId,
      conversationId,
      senderId: currentUser
        ? {
            _id: currentUser._id,
            name: currentUser.name,
            username: currentUser.username,
            avatar: currentUser.avatar,
          }
        : currentUser?._id || "",
      content: tempMessage,
      messageType: "text",
      isRead: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMessage]);

    // Scroll to bottom immediately
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);

    try {
      const response = await api.sendMessage(conversationId, {
        content: tempMessage,
        messageType: "text",
      });

      if (response.success && response.data) {
        const newMessage = response.data.message;

        // Replace optimistic message with real message from server
        setMessages((prev) => {
          // Remove optimistic message
          const withoutTemp = prev.filter((m) => m._id !== tempId);
          // Check if real message already exists (from socket)
          const exists = withoutTemp.some((m) => m._id === newMessage._id);
          if (exists) return withoutTemp;
          // Add real message
          return [...withoutTemp, newMessage];
        });

        // Refresh conversations to update last message
        setTimeout(() => {
          fetchConversations();
        }, 100);
      }
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast.error(error.message || "Failed to send message");
      setMessageText(tempMessage); // Restore message on error

      // Remove optimistic message on error
      setMessages((prev) => prev.filter((m) => m._id !== tempId));
    } finally {
      setIsLoading(false);
    }
  };

  const getOtherParticipant = (conversation: Conversation): User | null => {
    const userData = localStorage.getItem("user");
    if (!userData) return null;
    const currentUser = JSON.parse(userData);

    const other = conversation.participants?.find(
      (p: any) =>
        (typeof p === "object" ? p._id : p) !== currentUser._id &&
        (typeof p === "object" ? p._id : p) !== currentUser.id
    );

    return typeof other === "object" ? other : null;
  };

  const searchForUsers = async (query: string) => {
    if (!query.trim()) {
      setUsers([]);
      return;
    }
    setSearchingUsers(true);
    try {
      const response = await api.getUsers();
      if (response.success && response.data) {
        const filtered = (response.data.users || []).filter((user: User) => {
          const userData = localStorage.getItem("user");
          const currentUser = userData ? JSON.parse(userData) : null;
          // Don't show current user
          if (user._id === currentUser?._id || user._id === currentUser?.id) {
            return false;
          }
          // Filter by search query
          const searchLower = query.toLowerCase();
          return (
            user.name?.toLowerCase().includes(searchLower) ||
            user.username?.toLowerCase().includes(searchLower) ||
            user.email?.toLowerCase().includes(searchLower)
          );
        });
        setUsers(filtered);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to search users");
    } finally {
      setSearchingUsers(false);
    }
  };

  const handleCreateConversation = async (userId: string) => {
    setIsLoading(true);
    try {
      const response = await api.createConversation({
        participantIds: [userId],
        type: "direct",
      });
      if (response.success && response.data) {
        const newConversation = response.data.conversation;
        setSelectedConversation(newConversation);
        setShowNewConversation(false);
        setSearchUsers("");
        setUsers([]);
        await fetchConversations();

        // Immediately join the conversation room if socket is connected
        if (socket && socket.connected) {
          console.log("📥 Joining new conversation room:", newConversation._id);
          socket.emit("join_conversation", newConversation._id);
        }

        toast.success("Conversation started!");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to start conversation");
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (date: string) => {
    const messageDate = new Date(date);
    const now = new Date();
    const diff = now.getTime() - messageDate.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return messageDate.toLocaleDateString();
  };

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex overflow-hidden">
      {/* Conversations List */}
      <div className="w-full md:w-1/3 border-r border-gray-200 bg-white shadow-lg flex flex-col">
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-cyan-50 to-blue-50">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard")}
                size="sm"
                className="rounded-xl border-gray-300 bg-white hover:bg-gray-50 text-gray-700 shadow-sm"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-xl font-bold text-gray-900">Messages</h1>
            </div>
            <Button
              onClick={() => setShowNewConversation(true)}
              size="sm"
              className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/40"
            >
              <UserPlus className="h-4 w-4" />
            </Button>
          </div>
          {socket && !isConnected && (
            <div className="flex items-center gap-2 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-lg">
              <div className="h-2 w-2 rounded-full bg-orange-500 animate-pulse"></div>
              Connecting...
            </div>
          )}
          {socket && isConnected && (
            <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-lg">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              Connected
            </div>
          )}
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-cyan-100 to-blue-100 mb-4">
                <MessageCircle className="h-8 w-8 text-cyan-600" />
              </div>
              <p className="text-gray-500 font-medium">No conversations yet</p>
              <p className="text-sm text-gray-400 mt-1">
                Start a new conversation to begin messaging
              </p>
            </div>
          ) : (
            conversations.map((conversation) => {
              const other = getOtherParticipant(conversation);
              const isSelected = selectedConversation?._id === conversation._id;
              return (
                <div
                  key={conversation._id}
                  onClick={() => setSelectedConversation(conversation)}
                  className={`p-4 cursor-pointer transition-all border-b border-gray-100 ${
                    isSelected
                      ? "bg-gradient-to-r from-cyan-50 to-blue-50 border-l-4 border-l-cyan-500"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 ring-2 ring-offset-2 ring-cyan-200">
                      <AvatarImage src={other?.avatar} />
                      <AvatarFallback className="bg-gradient-to-br from-cyan-400 to-blue-500 text-white font-semibold">
                        {other?.name?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold text-gray-900 truncate">
                          {other?.name || "Unknown User"}
                        </p>
                        {typeof conversation.lastMessage === "object" && (
                          <span className="text-xs text-gray-400 ml-2">
                            {formatTime(conversation.lastMessage.createdAt)}
                          </span>
                        )}
                      </div>
                      {typeof conversation.lastMessage === "object" ? (
                        <p className="text-sm text-gray-600 truncate">
                          {conversation.lastMessage.content}
                        </p>
                      ) : (
                        <p className="text-sm text-gray-400 italic">
                          No messages yet
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* New Conversation Dialog */}
      <Dialog open={showNewConversation} onOpenChange={setShowNewConversation}>
        <DialogContent className="rounded-2xl max-w-md bg-white border-gray-200 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">
              New Message
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Search for a user to start a conversation
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by name, username, or email..."
                value={searchUsers}
                onChange={(e) => {
                  setSearchUsers(e.target.value);
                  searchForUsers(e.target.value);
                }}
                className="pl-10 rounded-xl border-gray-300 bg-white focus:border-cyan-500 focus:ring-cyan-500 text-gray-900"
              />
            </div>
            <div className="max-h-64 overflow-y-auto space-y-2">
              {searchingUsers ? (
                <div className="text-center text-gray-500 py-4">
                  Searching...
                </div>
              ) : users.length === 0 && searchUsers ? (
                <div className="text-center text-gray-500 py-4">
                  No users found
                </div>
              ) : (
                users.map((user) => (
                  <div
                    key={user._id}
                    onClick={() => handleCreateConversation(user._id)}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50 cursor-pointer transition-colors border border-transparent hover:border-cyan-200"
                  >
                    <Avatar className="ring-2 ring-offset-2 ring-cyan-200">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback className="bg-gradient-to-br from-cyan-400 to-blue-500 text-white font-semibold">
                        {user.name?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-500">@{user.username}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Messages Area */}
      <div className="flex-1 flex flex-col bg-gradient-to-br from-gray-50 to-white">
        {selectedConversation ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-gray-200 bg-white shadow-sm">
              {(() => {
                const other = getOtherParticipant(selectedConversation);
                return (
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 ring-2 ring-offset-2 ring-cyan-200">
                      <AvatarImage src={other?.avatar} />
                      <AvatarFallback className="bg-gradient-to-br from-cyan-400 to-blue-500 text-white font-semibold">
                        {other?.name?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">
                        {other?.name || "Unknown User"}
                      </p>
                      <p className="text-sm text-gray-500">
                        @{other?.username}
                      </p>
                    </div>
                    {isConnected && (
                      <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                        Online
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-transparent via-cyan-50/20 to-transparent max-h-[calc(100vh-200px)]">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-cyan-100 to-blue-100 mb-4">
                    <MessageCircle className="h-10 w-10 text-cyan-600" />
                  </div>
                  <p className="text-gray-500 font-medium">No messages yet</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Start the conversation by sending a message
                  </p>
                </div>
              ) : (
                messages.map((message) => {
                  const userData = localStorage.getItem("user");
                  const currentUser = userData ? JSON.parse(userData) : null;
                  const isOwnMessage =
                    (typeof message.senderId === "object"
                      ? message.senderId._id
                      : message.senderId) === currentUser?._id ||
                    (typeof message.senderId === "object"
                      ? message.senderId._id
                      : message.senderId) === currentUser?.id;

                  return (
                    <div
                      key={message._id}
                      className={`flex ${
                        isOwnMessage ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div className="flex items-end gap-2 max-w-[75%]">
                        {!isOwnMessage && (
                          <Avatar className="h-8 w-8 mb-1">
                            <AvatarImage
                              src={
                                typeof message.senderId === "object"
                                  ? message.senderId.avatar
                                  : ""
                              }
                            />
                            <AvatarFallback className="bg-gradient-to-br from-cyan-400 to-blue-500 text-white text-xs">
                              {typeof message.senderId === "object"
                                ? message.senderId.name?.charAt(0).toUpperCase()
                                : "U"}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div
                          className={`rounded-2xl px-4 py-2.5 shadow-md ${
                            isOwnMessage
                              ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white"
                              : "bg-white border border-gray-200 text-gray-900"
                          }`}
                        >
                          {!isOwnMessage && (
                            <p className="text-xs font-semibold mb-1 text-gray-700">
                              {typeof message.senderId === "object"
                                ? message.senderId.name
                                : "Unknown"}
                            </p>
                          )}
                          <p
                            className={`text-sm ${
                              isOwnMessage ? "text-white" : "text-gray-800"
                            }`}
                          >
                            {message.content}
                          </p>
                          <p
                            className={`text-xs mt-1 ${
                              isOwnMessage ? "text-cyan-100" : "text-gray-400"
                            }`}
                          >
                            {formatTime(message.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200 bg-white shadow-lg">
              <div className="flex gap-3">
                <Input
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Type a message..."
                  disabled={isLoading}
                  className="flex-1 rounded-xl border-gray-300 bg-white focus:border-cyan-500 focus:ring-cyan-500 text-gray-900 shadow-sm"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!messageText.trim() || isLoading}
                  className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/40 disabled:opacity-50 px-6"
                >
                  {isLoading ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-cyan-100 to-blue-100 mb-6">
              <MessageCircle className="h-12 w-12 text-cyan-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Select a conversation
            </h2>
            <p className="text-gray-500 max-w-md">
              Choose a conversation from the sidebar or start a new one to begin
              messaging
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
