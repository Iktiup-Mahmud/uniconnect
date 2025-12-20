import { Request, Response } from "express";
import mongoose from "mongoose";
import { asyncHandler } from "../middlewares";
import Conversation from "../models/Conversation.model";
import Message from "../models/Message.model";
import { AppError } from "../utils/appError";
import { getIO } from "../config/socket";

export const getConversations = asyncHandler(
  async (req: Request, res: Response) => {
    const conversations = await Conversation.find({
      participants: req.user._id,
    })
      .populate("participants", "name username avatar")
      .populate("lastMessage")
      .sort({ lastMessageAt: -1 });

    res.status(200).json({
      status: "success",
      message: "Conversations retrieved successfully",
      data: { conversations },
    });
  }
);

export const getConversationById = asyncHandler(
  async (req: Request, res: Response) => {
    const conversation = await Conversation.findById(req.params.id).populate(
      "participants",
      "name username avatar"
    );

    if (!conversation) {
      throw new AppError("Conversation not found", 404);
    }

    // Check if user is a participant
    const isParticipant = conversation.participants.some(
      (p: any) => p._id.toString() === req.user._id.toString()
    );

    if (!isParticipant) {
      throw new AppError("You don't have access to this conversation", 403);
    }

    const messages = await Message.find({ conversationId: conversation._id })
      .populate("senderId", "name username avatar")
      .sort({ createdAt: 1 });

    res.status(200).json({
      status: "success",
      message: "Conversation retrieved successfully",
      data: { conversation, messages },
    });
  }
);

export const createConversation = asyncHandler(
  async (req: Request, res: Response) => {
    const { participantIds, type, groupName, groupImage } = req.body;

    if (type === "direct" && participantIds.length !== 1) {
      throw new AppError(
        "Direct conversation must have exactly one other participant",
        400
      );
    }

    const participants = [req.user._id, ...participantIds];

    // Check if direct conversation already exists
    if (type === "direct") {
      const existing = await Conversation.findOne({
        type: "direct",
        participants: { $all: participants, $size: 2 },
      });

      if (existing) {
        await existing.populate("participants", "name username avatar");
        res.status(200).json({
          status: "success",
          message: "Conversation already exists",
          data: { conversation: existing },
        });
        return;
      }
    }

    const conversation = await Conversation.create({
      participants,
      type: type || "direct",
      groupName,
      groupImage,
    });

    await conversation.populate("participants", "name username avatar");

    res.status(201).json({
      status: "success",
      message: "Conversation created successfully",
      data: { conversation },
    });
  }
);

export const sendMessage = asyncHandler(async (req: Request, res: Response) => {
  const { conversationId } = req.params;
  const { content, messageType, fileUrl } = req.body;

  const conversation = await Conversation.findById(conversationId);

  if (!conversation) {
    throw new AppError("Conversation not found", 404);
  }

  // Check if user is a participant
  const isParticipant = conversation.participants.some(
    (p: any) => p.toString() === req.user._id.toString()
  );

  if (!isParticipant) {
    throw new AppError("You don't have access to this conversation", 403);
  }

  const message = await Message.create({
    conversationId,
    senderId: req.user._id,
    content,
    messageType: messageType || "text",
    fileUrl,
    isRead: false,
  });

  // Update conversation's last message
  conversation.lastMessage = message._id as mongoose.Types.ObjectId;
  conversation.lastMessageAt = new Date();
  await conversation.save();

  await message.populate("senderId", "name username avatar");

  // Emit Socket.io event for real-time messaging
  try {
    const io = getIO();
    // Convert to plain object and ensure all fields are present
    const messageObj = message.toObject ? message.toObject() : JSON.parse(JSON.stringify(message));
    
    console.log(`\n📤 Emitting new_message to conversation:${conversationId}`);
    console.log(`Message ID: ${messageObj._id}, Content: ${messageObj.content?.substring(0, 50)}`);
    
    // Check which sockets are in this room
    try {
      const socketsInRoom = await io.in(`conversation:${conversationId}`).fetchSockets();
      console.log(`👥 Number of sockets in conversation:${conversationId}: ${socketsInRoom.length}`);
      if (socketsInRoom.length === 0) {
        console.log("⚠️ WARNING: No sockets found in this conversation room!");
      }
      socketsInRoom.forEach((s: any) => {
        console.log(`  - Socket ID: ${s.id}, User: ${s.userId || 'unknown'}`);
      });
    } catch (err) {
      console.log("⚠️ Error fetching sockets:", err);
    }
    
    // Emit to all users in the conversation room (including sender)
    io.to(`conversation:${conversationId}`).emit("new_message", {
      conversationId,
      message: messageObj,
    });
    
    console.log(`✅ Message emitted to room conversation:${conversationId}\n`);

    // Also notify other participants in their personal rooms (excluding sender)
    conversation.participants.forEach((participantId: any) => {
      if (participantId.toString() !== req.user._id.toString()) {
        console.log(`Notifying user:${participantId} about new message`);
        io.to(`user:${participantId}`).emit("message_notification", {
          conversationId,
          message: messageObj,
        });
      }
    });
  } catch (error) {
    // Socket.io might not be initialized, continue anyway
    console.error("Socket.io error:", error);
  }

  res.status(201).json({
    status: "success",
    message: "Message sent successfully",
    data: { message },
  });
});

export const markMessagesAsRead = asyncHandler(
  async (req: Request, res: Response) => {
    const { conversationId } = req.params;

    await Message.updateMany(
      {
        conversationId,
        senderId: { $ne: req.user._id },
        isRead: false,
      },
      {
        isRead: true,
        readAt: new Date(),
      }
    );

    res.status(200).json({
      status: "success",
      message: "Messages marked as read",
    });
  }
);
