import mongoose, { Document, Schema } from "mongoose";

export interface IClub extends Document {
  name: string;
  description: string;
  organizer: mongoose.Types.ObjectId;
  members: mongoose.Types.ObjectId[];
  events: mongoose.Types.ObjectId[];
  imageUrl?: string;
  category: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const clubSchema = new Schema<IClub>(
  {
    name: {
      type: String,
      required: [true, "Club name is required"],
      maxlength: [100, "Club name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    organizer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Organizer is required"],
    },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    events: [
      {
        type: Schema.Types.ObjectId,
        ref: "Event",
      },
    ],
    imageUrl: {
      type: String,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "Academic",
        "Sports",
        "Arts",
        "Technology",
        "Cultural",
        "Social",
        "Volunteer",
        "Other",
      ],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

clubSchema.index({ organizer: 1 });
clubSchema.index({ category: 1 });
clubSchema.index({ isActive: 1 });

export default mongoose.model<IClub>("Club", clubSchema);

