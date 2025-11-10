import { Request, Response } from 'express';
import { asyncHandler } from '../middlewares';

export const getAllUsers = asyncHandler(
  async (_req: Request, res: Response) => {
    // TODO: Implement get all users
    res.status(200).json({
      status: 'success',
      message: 'Get all users',
      data: {
        users: [],
      },
    });
  }
);

export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  // TODO: Implement get user by ID
  res.status(200).json({
    status: 'success',
    message: 'Get user by ID',
    data: {
      user: {
        id: req.params.id,
      },
    },
  });
});

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  // TODO: Implement update user
  res.status(200).json({
    status: 'success',
    message: 'User updated successfully',
    data: {
      user: {
        id: req.params.id,
        ...req.body,
      },
    },
  });
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  // TODO: Implement delete user
  res.status(200).json({
    status: 'success',
    message: 'User deleted successfully',
    data: {
      id: req.params.id,
    },
  });
});
