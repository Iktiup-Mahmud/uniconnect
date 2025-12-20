import { Server as HTTPServer } from "http";
import jwt from "jsonwebtoken";
import User from "../models/User.model";

// Try to import socket.io, but handle if it's not installed
let SocketIOServer: any;
try {
  const socketIO = require("socket.io");
  SocketIOServer = socketIO.Server;
} catch (error) {
  console.warn("Socket.io not installed. Real-time messaging will be disabled.");
  console.warn("Install with: npm install socket.io @types/socket.io");
}

interface AuthenticatedSocket {
  id: string;
  userId?: string;
  join: (room: string) => void;
  leave: (room: string) => void;
  on: (event: string, callback: (...args: any[]) => void) => void;
  to: (room: string) => { emit: (event: string, data: any) => void };
  handshake: {
    auth: any;
    headers: any;
  };
  emit: (event: string, data: any) => void;
  rooms: Set<string>;
  connected: boolean;
}

let io: any = null;

export const initializeSocket = (httpServer: HTTPServer) => {
  if (!SocketIOServer) {
    console.warn("Socket.io not available. Skipping Socket.io initialization.");
    return null;
  }

  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      credentials: true,
    },
  });

  // Authentication middleware for Socket.io
  io.use(async (socket: any, next: (err?: Error) => void) => {
    try {
      const authSocket = socket as AuthenticatedSocket;
      const token = (authSocket.handshake.auth as any)?.token || 
                    (authSocket.handshake.headers as any)?.authorization?.replace("Bearer ", "");

      if (!token) {
        return next(new Error("Authentication error: No token provided"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key") as { id: string };
      const user = await User.findById(decoded.id);

      if (!user) {
        return next(new Error("Authentication error: User not found"));
      }

      authSocket.userId = decoded.id;
      next();
    } catch (error) {
      next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", (socket: any) => {
    const authSocket = socket as AuthenticatedSocket;
    const userId = authSocket.userId;
    if (!userId) {
      console.log("❌ Socket connected without userId");
      return;
    }

    console.log(`✅ User ${userId} connected to Socket.io, Socket ID: ${socket.id}`);

    // Join user's personal room
    authSocket.join(`user:${userId}`);
    console.log(`📥 User ${userId} joined personal room: user:${userId}`);

    // Handle joining a conversation room
    authSocket.on("join_conversation", (conversationId: string) => {
      console.log(`📥 User ${userId} joining conversation room: conversation:${conversationId}`);
      authSocket.join(`conversation:${conversationId}`);
      console.log(`✅ User ${userId} successfully joined conversation:${conversationId}`);
      
      // Confirm room membership
      const rooms = Array.from(authSocket.rooms);
      console.log(`📋 User ${userId} is now in rooms:`, rooms);
    });

    // Handle leaving a conversation room
    authSocket.on("leave_conversation", (conversationId: string) => {
      console.log(`User ${userId} leaving conversation room: conversation:${conversationId}`);
      authSocket.leave(`conversation:${conversationId}`);
    });

    // Handle sending a message
    authSocket.on("send_message", async (data: { conversationId: string; message: any }) => {
      // Emit to all users in the conversation
      io?.to(`conversation:${data.conversationId}`).emit("new_message", {
        conversationId: data.conversationId,
        message: data.message,
      });

      // Notify other participants (excluding sender)
      const conversation = await import("../models/Conversation.model").then(
        (m) => m.default
      );
      const conv = await conversation.findById(data.conversationId);
      if (conv) {
        conv.participants.forEach((participantId: any) => {
          if (participantId.toString() !== userId) {
            io?.to(`user:${participantId}`).emit("message_notification", {
              conversationId: data.conversationId,
              message: data.message,
            });
          }
        });
      }
    });

    // Handle typing indicator
    authSocket.on("typing_start", (data: { conversationId: string }) => {
      authSocket.to(`conversation:${data.conversationId}`).emit("user_typing", {
        userId,
        conversationId: data.conversationId,
      });
    });

    authSocket.on("typing_stop", (data: { conversationId: string }) => {
      authSocket.to(`conversation:${data.conversationId}`).emit("user_stopped_typing", {
        userId,
        conversationId: data.conversationId,
      });
    });

    // Handle disconnect
    authSocket.on("disconnect", () => {
      console.log(`User ${userId} disconnected`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized. Call initializeSocket first.");
  }
  return io;
};

