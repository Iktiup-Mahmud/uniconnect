import mongoose, { Document, Schema } from "mongoose";

export interface IAnnouncement extends Document {
  title: string;
  content: string;
  author: mongoose.Types.ObjectId;
  targetAudience: "all" | "students" | "faculty" | "club_members";
  courseId?: mongoose.Types.ObjectId;
  clubId?: mongoose.Types.ObjectId;
  isPinned: boolean;
  attachments?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const announcementSchema = new Schema<IAnnouncement>(
  {
    title: {
      type: String,
      required: [true, "Announcement title is required"],
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    content: {
      type: String,
      required: [true, "Announcement content is required"],
      maxlength: [5000, "Content cannot exceed 5000 characters"],
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Author is required"],
    },
    targetAudience: {
      type: String,
      enum: ["all", "students", "faculty", "club_members"],
      default: "all",
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "Course",
    },
    clubId: {
      type: Schema.Types.ObjectId,
      ref: "Club",
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    attachments: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

announcementSchema.index({ author: 1 });
announcementSchema.index({ courseId: 1 });
announcementSchema.index({ clubId: 1 });
announcementSchema.index({ isPinned: 1, createdAt: -1 });
announcementSchema.index({ targetAudience: 1, createdAt: -1 });

export default mongoose.model<IAnnouncement>("Announcement", announcementSchema);

