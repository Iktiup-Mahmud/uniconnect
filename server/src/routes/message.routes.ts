import { Router } from "express";
import {
  getConversations,
  getConversationById,
  createConversation,
  sendMessage,
  markMessagesAsRead,
} from "../controllers/message.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.get("/conversations", authenticate, getConversations);
router.get("/conversations/:id", authenticate, getConversationById);
router.post("/conversations", authenticate, createConversation);
router.post("/conversations/:conversationId/messages", authenticate, sendMessage);
router.put("/conversations/:conversationId/read", authenticate, markMessagesAsRead);

export default router;

