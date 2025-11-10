import { Request, Response } from 'express';
import { asyncHandler } from '../middlewares';

export const register = asyncHandler(async (req: Request, res: Response) => {
  // TODO: Implement user registration
  res.status(201).json({
    status: 'success',
    message: 'User registered successfully',
    data: {
      user: req.body,
    },
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  // TODO: Implement user login
  res.status(200).json({
    status: 'success',
    message: 'User logged in successfully',
    data: {
      token: 'sample-jwt-token',
      user: req.body,
    },
  });
});

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  // TODO: Implement user logout
  res.status(200).json({
    status: 'success',
    message: 'User logged out successfully',
  });
});

export const refreshToken = asyncHandler(
  async (_req: Request, res: Response) => {
    // TODO: Implement token refresh
    res.status(200).json({
      status: 'success',
      message: 'Token refreshed successfully',
      data: {
        token: 'new-sample-jwt-token',
      },
    });
  }
);
