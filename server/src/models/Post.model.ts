import mongoose, { Document, Schema, Model } from "mongoose";

// Post interface
export interface IPost extends Document {
  userId: mongoose.Types.ObjectId;
  content: string;
  images?: string[];
  likes: mongoose.Types.ObjectId[];
  comments: number;
  createdAt: Date;
  updatedAt: Date;
}

// Post schema
const postSchema = new Schema<IPost>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    content: {
      type: String,
      required: [true, "Post content is required"],
      trim: true,
      maxlength: [5000, "Post content cannot exceed 5000 characters"],
    },
    images: [
      {
        type: String,
      },
    ],
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    comments: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
postSchema.index({ userId: 1, createdAt: -1 });
postSchema.index({ createdAt: -1 });

// Create and export model
const Post: Model<IPost> = mongoose.model<IPost>("Post", postSchema);

export default Post;
