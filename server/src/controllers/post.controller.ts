import { Request, Response } from 'express';
import { asyncHandler } from '../middlewares';

export const getAllPosts = asyncHandler(
  async (_req: Request, res: Response) => {
    // TODO: Implement get all posts
    res.status(200).json({
      status: 'success',
      message: 'Get all posts',
      data: {
        posts: [],
      },
    });
  }
);

export const getPostById = asyncHandler(async (req: Request, res: Response) => {
  // TODO: Implement get post by ID
  res.status(200).json({
    status: 'success',
    message: 'Get post by ID',
    data: {
      post: {
        id: req.params.id,
      },
    },
  });
});

export const createPost = asyncHandler(async (req: Request, res: Response) => {
  // TODO: Implement create post
  res.status(201).json({
    status: 'success',
    message: 'Post created successfully',
    data: {
      post: req.body,
    },
  });
});

export const updatePost = asyncHandler(async (req: Request, res: Response) => {
  // TODO: Implement update post
  res.status(200).json({
    status: 'success',
    message: 'Post updated successfully',
    data: {
      post: {
        id: req.params.id,
        ...req.body,
      },
    },
  });
});

export const deletePost = asyncHandler(async (req: Request, res: Response) => {
  // TODO: Implement delete post
  res.status(200).json({
    status: 'success',
    message: 'Post deleted successfully',
    data: {
      id: req.params.id,
    },
  });
});
