import mongoose, { Document, Schema } from "mongoose";

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type:
    | "post_like"
    | "post_comment"
    | "event_invite"
    | "club_invite"
    | "course_announcement"
    | "assignment_due"
    | "message"
    | "follow"
    | "system";
  title: string;
  message: string;
  relatedId?: mongoose.Types.ObjectId;
  relatedType?: "post" | "event" | "club" | "course" | "message" | "user";
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    type: {
      type: String,
      enum: [
        "post_like",
        "post_comment",
        "event_invite",
        "club_invite",
        "course_announcement",
        "assignment_due",
        "message",
        "follow",
        "system",
      ],
      required: true,
    },
    title: {
      type: String,
      required: [true, "Notification title is required"],
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    message: {
      type: String,
      required: [true, "Notification message is required"],
      maxlength: [500, "Message cannot exceed 500 characters"],
    },
    relatedId: {
      type: Schema.Types.ObjectId,
    },
    relatedType: {
      type: String,
      enum: ["post", "event", "club", "course", "message", "user"],
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model<INotification>("Notification", notificationSchema);

