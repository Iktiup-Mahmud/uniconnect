import { v2 as cloudinary } from "cloudinary";
import multer from "multer";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "",
  api_key: process.env.CLOUDINARY_API_KEY || "",
  api_secret: process.env.CLOUDINARY_API_SECRET || "",
});

// Memory storage for Multer (files stored in memory before uploading to Cloudinary)
const memoryStorage = multer.memoryStorage();

// Multer upload middleware for images
export const uploadImage = multer({
  storage: memoryStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

// Multer upload middleware for videos
export const uploadVideo = multer({
  storage: memoryStorage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("video/")) {
      cb(null, true);
    } else {
      cb(new Error("Only video files are allowed"));
    }
  },
});

// Multer upload middleware for profile pictures
export const uploadProfile = multer({
  storage: memoryStorage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

// Multer upload middleware for mixed media (images and videos)
export const uploadMedia = multer({
  storage: memoryStorage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image and video files are allowed"));
    }
  },
});

// Helper function to upload file buffer to Cloudinary
export const uploadToCloudinary = async (
  file: Express.Multer.File,
  folder: string = "uniconnect/uploads"
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const isVideo = file.mimetype.startsWith("video/");
    
    const uploadOptions: any = {
      folder,
      public_id: `${Date.now()}-${Math.round(Math.random() * 1e9)}`,
    };

    if (isVideo) {
      uploadOptions.resource_type = "video";
      uploadOptions.format = "mp4";
    } else {
      uploadOptions.transformation = [
        {
          width: 1200,
          height: 1200,
          crop: "limit",
          quality: "auto",
        },
      ];
    }

    // Upload buffer directly to Cloudinary
    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result?.secure_url || "");
        }
      }
    );

    // Write buffer to stream
    uploadStream.end(file.buffer);
  });
};

// Helper function to upload profile picture with specific transformations
export const uploadProfilePicture = async (
  file: Express.Multer.File
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const uploadOptions: any = {
      folder: "uniconnect/profiles",
      public_id: `${Date.now()}-${Math.round(Math.random() * 1e9)}`,
      transformation: [
        {
          width: 400,
          height: 400,
          crop: "fill",
          gravity: "face",
          quality: "auto",
        },
      ],
    };

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result?.secure_url || "");
        }
      }
    );

    uploadStream.end(file.buffer);
  });
};

export default cloudinary;

