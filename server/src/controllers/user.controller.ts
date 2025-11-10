import { Request, Response } from "express";
import { asyncHandler } from "../middlewares";
import User from "../models/User.model";
import { AppError } from "../utils/appError";

export const getAllUsers = asyncHandler(
  async (_req: Request, res: Response) => {
    const users = await User.find().select("-password").limit(50);

    res.status(200).json({
      status: "success",
      message: "Get all users",
      data: {
        users,
        count: users.length,
      },
    });
  },
);

export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id).select("-password");

  if (!user) {
    throw new AppError("User not found", 404);
  }

  res.status(200).json({
    status: "success",
    message: "Get user by ID",
    data: {
      user,
    },
  });
});

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const { name, bio, avatar } = req.body;

  const user = await User.findById(req.params.id);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (name) user.name = name;
  if (bio !== undefined) user.bio = bio;
  if (avatar !== undefined) user.avatar = avatar;

  await user.save();

  const updatedUser = user.toObject() as any;
  delete updatedUser.password;

  res.status(200).json({
    status: "success",
    message: "User updated successfully",
    data: {
      user: updatedUser,
    },
  });
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  res.status(200).json({
    status: "success",
    message: "User deleted successfully",
    data: {
      id: req.params.id,
    },
  });
});
