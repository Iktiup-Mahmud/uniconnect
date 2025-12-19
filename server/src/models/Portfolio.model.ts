import mongoose, { Document, Schema } from "mongoose";

export interface IPortfolio extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  projects: {
    name: string;
    description: string;
    technologies: string[];
    githubUrl?: string;
    liveUrl?: string;
    imageUrl?: string;
  }[];
  achievements: {
    title: string;
    description: string;
    date: Date;
    issuer?: string;
  }[];
  skills: string[];
  education: {
    degree: string;
    institution: string;
    year: number;
    gpa?: string;
  }[];
  certifications: {
    name: string;
    issuer: string;
    date: Date;
    credentialId?: string;
    url?: string;
  }[];
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const portfolioSchema = new Schema<IPortfolio>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      unique: true,
    },
    title: {
      type: String,
      required: [true, "Portfolio title is required"],
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
      default: "",
    },
    projects: [
      {
        name: { type: String, required: true },
        description: { type: String, required: true },
        technologies: [{ type: String }],
        githubUrl: { type: String },
        liveUrl: { type: String },
        imageUrl: { type: String },
      },
    ],
    achievements: [
      {
        title: { type: String, required: true },
        description: { type: String },
        date: { type: Date, required: true },
        issuer: { type: String },
      },
    ],
    skills: [{ type: String }],
    education: [
      {
        degree: { type: String, required: true },
        institution: { type: String, required: true },
        year: { type: Number, required: true },
        gpa: { type: String },
      },
    ],
    certifications: [
      {
        name: { type: String, required: true },
        issuer: { type: String, required: true },
        date: { type: Date, required: true },
        credentialId: { type: String },
        url: { type: String },
      },
    ],
    isPublic: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

portfolioSchema.index({ userId: 1 });
portfolioSchema.index({ isPublic: 1 });

export default mongoose.model<IPortfolio>("Portfolio", portfolioSchema);

