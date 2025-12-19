import { Request, Response } from "express";
import { asyncHandler } from "../middlewares";
import { uploadToCloudinary, uploadProfilePicture } from "../config/cloudinary";
import { AppError } from "../utils/appError";
import User from "../models/User.model";

export const uploadProfilePictureController = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.file) {
      throw new AppError("No file uploaded", 400);
    }

    try {
      const imageUrl = await uploadProfilePicture(req.file);

      // Update user profile
      const user = await User.findById(req.user._id);
      if (!user) {
        throw new AppError("User not found", 404);
      }

      user.avatar = imageUrl;
      await user.save();

      res.status(200).json({
        status: "success",
        message: "Profile picture uploaded successfully",
        data: {
          avatar: imageUrl,
        },
      });
    } catch (error: unknown) {
      throw new AppError(
        error instanceof Error ? error.message : "Failed to upload image",
        500
      );
    }
  }
);

export const uploadPostMediaController = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.file) {
      throw new AppError("No file uploaded", 400);
    }

    try {
      const folder =
        req.body.type === "video" ? "uniconnect/videos" : "uniconnect/images";
      const imageUrl = await uploadToCloudinary(req.file, folder);

      res.status(200).json({
        status: "success",
        message: "Media uploaded successfully",
        data: {
          url: imageUrl,
          type: req.file.mimetype.startsWith("video/") ? "video" : "image",
        },
      });
    } catch (error: unknown) {
      throw new AppError(
        error instanceof Error ? error.message : "Failed to upload media",
        500
      );
    }
  }
);

export const uploadMultipleMediaController = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.files) {
      throw new AppError("No files uploaded", 400);
    }

    try {
      // Handle both array and object formats from multer
      let files: Express.Multer.File[] = [];

      if (Array.isArray(req.files)) {
        files = req.files;
      } else {
        // If it's an object, extract files from all fields
        files = Object.values(req.files).flat();
      }

      if (files.length === 0) {
        throw new AppError("No files uploaded", 400);
      }

      const uploadPromises = files.map((file: Express.Multer.File) => {
        const folder = file.mimetype.startsWith("video/")
          ? "uniconnect/videos"
          : "uniconnect/images";
        return uploadToCloudinary(file, folder);
      });

      const urls = await Promise.all(uploadPromises);

      res.status(200).json({
        status: "success",
        message: "Media files uploaded successfully",
        data: {
          urls,
        },
      });
    } catch (error: unknown) {
      throw new AppError(
        error instanceof Error ? error.message : "Failed to upload media",
        500
      );
    }
  }
);
