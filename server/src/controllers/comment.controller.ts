import { Request, Response } from "express";
import { asyncHandler } from "../middlewares";
import Comment from "../models/Comment.model";
import Post from "../models/Post.model";
import { AppError } from "../utils/appError";
import { Types } from "mongoose";

export const getCommentsByPost = asyncHandler(
  async (req: Request, res: Response) => {
    const { postId } = req.params;

    const comments = await Comment.find({ postId })
      .populate("userId", "name username avatar")
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: "success",
      message: "Comments retrieved successfully",
      data: { comments },
    });
  }
);

export const createComment = asyncHandler(
  async (req: Request, res: Response) => {
    const { postId } = req.params;
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      throw new AppError("Comment content is required", 400);
    }

    // Verify post exists
    const post = await Post.findById(postId);
    if (!post) {
      throw new AppError("Post not found", 404);
    }

    // Create comment
    const comment = await Comment.create({
      postId,
      userId: req.user._id,
      content: content.trim(),
    });

    // Update post comment count
    post.comments.push(comment._id as Types.ObjectId);
    await post.save();

    await comment.populate("userId", "name username avatar");

    res.status(201).json({
      status: "success",
      message: "Comment created successfully",
      data: { comment },
    });
  }
);

export const updateComment = asyncHandler(
  async (req: Request, res: Response) => {
    const { commentId } = req.params;
    const { content } = req.body;

    const comment = await Comment.findById(commentId);

    if (!comment) {
      throw new AppError("Comment not found", 404);
    }

    // Check if user is the author
    if (comment.userId.toString() !== req.user._id.toString()) {
      throw new AppError("You can only update your own comments", 403);
    }

    if (content) {
      comment.content = content.trim();
      await comment.save();
    }

    await comment.populate("userId", "name username avatar");

    res.status(200).json({
      status: "success",
      message: "Comment updated successfully",
      data: { comment },
    });
  }
);

export const deleteComment = asyncHandler(
  async (req: Request, res: Response) => {
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);

    if (!comment) {
      throw new AppError("Comment not found", 404);
    }

    // Check if user is the author or admin
    if (
      comment.userId.toString() !== req.user._id.toString() &&
      req.user?.role !== "admin"
    ) {
      throw new AppError("You can only delete your own comments", 403);
    }

    // Remove comment from post
    await Post.findByIdAndUpdate(comment.postId, {
      $pull: { comments: comment._id },
    });

    await Comment.findByIdAndDelete(commentId);

    res.status(200).json({
      status: "success",
      message: "Comment deleted successfully",
    });
  }
);

export const likeComment = asyncHandler(async (req: Request, res: Response) => {
  const { commentId } = req.params;

  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new AppError("Comment not found", 404);
  }

  const userId = req.user._id;
  const likesAsStrings = comment.likes.map((like) => like.toString());
  const likeIndex = likesAsStrings.indexOf(userId.toString());

  if (likeIndex === -1) {
    // Like the comment
    comment.likes.push(userId);
  } else {
    // Unlike the comment
    comment.likes.splice(likeIndex, 1);
  }

  await comment.save();
  await comment.populate("userId", "name username avatar");

  res.status(200).json({
    status: "success",
    message: likeIndex === -1 ? "Comment liked" : "Comment unliked",
    data: { comment },
  });
});
