import { Router } from "express";
import {
  getCommentsByPost,
  createComment,
  updateComment,
  deleteComment,
  likeComment,
} from "../controllers/comment.controller";
import { authenticate, optionalAuth } from "../middlewares/auth.middleware";

const router = Router();

router.get("/posts/:postId", optionalAuth, getCommentsByPost);
router.post("/posts/:postId", authenticate, createComment);
router.put("/:commentId", authenticate, updateComment);
router.delete("/:commentId", authenticate, deleteComment);
router.post("/:commentId/like", authenticate, likeComment);

export default router;

