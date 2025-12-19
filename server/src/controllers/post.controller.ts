import { Request, Response } from "express";
import { asyncHandler } from "../middlewares";
import Post from "../models/Post.model";
import { AppError } from "../utils/appError";

export const getAllPosts = asyncHandler(
  async (_req: Request, res: Response) => {
    const posts = await Post.find()
      .populate("author", "name username avatar")
      .populate({
        path: "comments",
        populate: {
          path: "userId",
          select: "name username avatar",
        },
        options: { sort: { createdAt: -1 }, limit: 5 }, // Get latest 5 comments
      })
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
  const { content, images, videos } = req.body;

  if (!content && (!images || images.length === 0) && (!videos || videos.length === 0)) {
    throw new AppError("Post must have content, images, or videos", 400);
  }

  if (!req.user) {
    throw new AppError("User not authenticated", 401);
  }

  // Combine images and videos into images array (for backward compatibility)
  const mediaUrls = [
      ...(images || []),
      ...(videos || []),
    ];

  const post = await Post.create({
    content: content || "",
    images: mediaUrls,
    author: req.user._id,
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

  // Check if user is the author
  if (post.author.toString() !== req.user._id.toString()) {
    throw new AppError("You can only update your own posts", 403);
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
  const post = await Post.findById(req.params.id);

  if (!post) {
    throw new AppError("Post not found", 404);
  }

  // Check if user is the author
  if (post.author.toString() !== req.user._id.toString()) {
    throw new AppError("You can only delete your own posts", 403);
  }

  await Post.findByIdAndDelete(req.params.id);

  res.status(200).json({
    status: "success",
    message: "Post deleted successfully",
    data: {
      id: req.params.id,
    },
  });
});

export const likePost = asyncHandler(async (req: Request, res: Response) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    throw new AppError("Post not found", 404);
  }

  const userId = req.user._id;
  // Convert likes array to strings for comparison
  const likesAsStrings = post.likes.map((like) => like.toString());
  const likeIndex = likesAsStrings.indexOf(userId.toString());

  if (likeIndex === -1) {
    // Like the post - push ObjectId, not string
    post.likes.push(userId);
  } else {
    // Unlike the post
    post.likes.splice(likeIndex, 1);
  }

  await post.save();
  await post.populate("author", "name username avatar");

  res.status(200).json({
    status: "success",
    message: likeIndex === -1 ? "Post liked" : "Post unliked",
    data: {
      post,
    },
  });
});
