import { Request, Response } from "express";
import { asyncHandler } from "../middlewares";
import Post from "../models/Post.model";
import { AppError } from "../utils/appError";

export const getAllPosts = asyncHandler(
  async (_req: Request, res: Response) => {
    const posts = await Post.find()
      .populate("author", "name username avatar")
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      status: "success",
      message: "Get all posts",
      data: {
        posts,
        count: posts.length,
      },
    });
  },
);

export const getPostById = asyncHandler(async (req: Request, res: Response) => {
  const post = await Post.findById(req.params.id)
    .populate("author", "name username avatar")
    .populate({
      path: "comments",
      populate: {
        path: "author",
        select: "name username avatar",
      },
    });

  if (!post) {
    throw new AppError("Post not found", 404);
  }

  res.status(200).json({
    status: "success",
    message: "Get post by ID",
    data: {
      post,
    },
  });
});

export const createPost = asyncHandler(async (req: Request, res: Response) => {
  const { content, images, author } = req.body;

  if (!content || !author) {
    throw new AppError("Content and author are required", 400);
  }

  const post = await Post.create({
    content,
    images,
    author,
  });

  await post.populate("author", "name username avatar");

  res.status(201).json({
    status: "success",
    message: "Post created successfully",
    data: {
      post,
    },
  });
});

export const updatePost = asyncHandler(async (req: Request, res: Response) => {
  const { content, images } = req.body;

  const post = await Post.findById(req.params.id);

  if (!post) {
    throw new AppError("Post not found", 404);
  }

  if (content) post.content = content;
  if (images !== undefined) post.images = images;

  await post.save();
  await post.populate("author", "name username avatar");

  res.status(200).json({
    status: "success",
    message: "Post updated successfully",
    data: {
      post,
    },
  });
});

export const deletePost = asyncHandler(async (req: Request, res: Response) => {
  const post = await Post.findByIdAndDelete(req.params.id);

  if (!post) {
    throw new AppError("Post not found", 404);
  }

  res.status(200).json({
    status: "success",
    message: "Post deleted successfully",
    data: {
      id: req.params.id,
    },
  });
});
