import { Router } from "express";
import {
  uploadProfilePictureController,
  uploadPostMediaController,
  uploadMultipleMediaController,
} from "../controllers/upload.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { uploadProfile, uploadMedia, uploadImage } from "../config/cloudinary";

const router = Router();

// Upload profile picture
router.post(
  "/profile",
  authenticate,
  uploadProfile.single("avatar"),
  uploadProfilePictureController
);

// Upload single media file (image or video) for posts
router.post(
  "/media",
  authenticate,
  uploadMedia.single("media"),
  uploadPostMediaController
);

// Upload multiple media files for posts
router.post(
  "/media/multiple",
  authenticate,
  uploadImage.array("media", 10), // Max 10 files
  uploadMultipleMediaController
);

export default router;

