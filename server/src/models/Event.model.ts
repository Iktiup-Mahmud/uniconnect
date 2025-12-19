import mongoose, { Document, Schema } from "mongoose";

export interface IEvent extends Document {
  title: string;
  description: string;
  organizer: mongoose.Types.ObjectId;
  clubId?: mongoose.Types.ObjectId;
  courseId?: mongoose.Types.ObjectId;
  eventDate: Date;
  location: string;
  imageUrl?: string;
  attendees: mongoose.Types.ObjectId[];
  maxAttendees?: number;
  isPublic: boolean;
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

const eventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: [true, "Event title is required"],
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    organizer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Organizer is required"],
    },
    clubId: {
      type: Schema.Types.ObjectId,
      ref: "Club",
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "Course",
    },
    eventDate: {
      type: Date,
      required: [true, "Event date is required"],
    },
    location: {
      type: String,
      required: [true, "Location is required"],
    },
    imageUrl: {
      type: String,
    },
    attendees: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    maxAttendees: {
      type: Number,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "Workshop",
        "Seminar",
        "Conference",
        "Social",
        "Sports",
        "Cultural",
        "Academic",
        "Other",
      ],
    },
  },
  {
    timestamps: true,
  }
);

eventSchema.index({ organizer: 1 });
eventSchema.index({ eventDate: 1 });
eventSchema.index({ clubId: 1 });
eventSchema.index({ courseId: 1 });
eventSchema.index({ isPublic: 1 });

export default mongoose.model<IEvent>("Event", eventSchema);

