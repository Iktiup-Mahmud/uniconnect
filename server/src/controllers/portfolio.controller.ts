import { Request, Response } from "express";
import { asyncHandler } from "../middlewares";
import Portfolio from "../models/Portfolio.model";
import { AppError } from "../utils/appError";

export const getPortfolio = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const portfolio = await Portfolio.findOne({ userId }).populate(
    "userId",
    "name username avatar role"
  );

  if (!portfolio) {
    throw new AppError("Portfolio not found", 404);
  }

  // Check if portfolio is public or user owns it
  if (!portfolio.isPublic && portfolio.userId.toString() !== req.user?._id?.toString()) {
    throw new AppError("Portfolio is private", 403);
  }

  res.status(200).json({
    status: "success",
    message: "Portfolio retrieved successfully",
    data: { portfolio },
  });
});

export const createOrUpdatePortfolio = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user._id;
    const {
      title,
      description,
      projects,
      achievements,
      skills,
      education,
      certifications,
      isPublic,
    } = req.body;

    const portfolio = await Portfolio.findOneAndUpdate(
      { userId },
      {
        title,
        description,
        projects: projects || [],
        achievements: achievements || [],
        skills: skills || [],
        education: education || [],
        certifications: certifications || [],
        isPublic: isPublic !== undefined ? isPublic : false,
      },
      { new: true, upsert: true, runValidators: true }
    ).populate("userId", "name username avatar role");

    res.status(200).json({
      status: "success",
      message: "Portfolio updated successfully",
      data: { portfolio },
    });
  }
);

export const deletePortfolio = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user._id;
  const portfolio = await Portfolio.findOneAndDelete({ userId });

  if (!portfolio) {
    throw new AppError("Portfolio not found", 404);
  }

  res.status(200).json({
    status: "success",
    message: "Portfolio deleted successfully",
  });
});

