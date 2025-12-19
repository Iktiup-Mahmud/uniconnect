import { Request, Response } from 'express';
import { asyncHandler } from '../middlewares';
import User from '../models/User.model';
import * as jwt from 'jsonwebtoken';
import { AppError } from '../utils/appError';
import { Types } from 'mongoose';

const generateToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET || 'default-secret';
  return jwt.sign({ userId }, secret, { expiresIn: '7d' });
};

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, username, email, password } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (existingUser) {
    throw new AppError('User with this email or username already exists', 400);
  }

  // Create new user
  const user = await User.create({
    name,
    username,
    email,
    password,
  });

  // Generate token
  const token = generateToken((user._id as Types.ObjectId).toString());

  res.status(201).json({
    status: 'success',
    message: 'User registered successfully',
    data: {
      token,
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
      },
    },
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Check if email and password exist
  if (!email || !password) {
    throw new AppError('Please provide email and password', 400);
  }

  // Check if user exists
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password', 401);
  }

  // Generate token
  const token = generateToken((user._id as Types.ObjectId).toString());

  res.status(200).json({
    status: 'success',
    message: 'User logged in successfully',
    data: {
      token,
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
      },
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
