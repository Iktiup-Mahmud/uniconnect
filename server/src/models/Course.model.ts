import mongoose, { Document, Schema } from "mongoose";

export interface ICourse extends Document {
  code: string;
  name: string;
  description: string;
  instructor: mongoose.Types.ObjectId;
  students: mongoose.Types.ObjectId[];
  materials: {
    title: string;
    type: "document" | "video" | "link" | "assignment";
    url: string;
    description?: string;
    uploadedAt: Date;
  }[];
  announcements: mongoose.Types.ObjectId[];
  assignments: {
    title: string;
    description: string;
    dueDate: Date;
    maxScore: number;
    submissions: {
      studentId: mongoose.Types.ObjectId;
      submittedAt: Date;
      fileUrl?: string;
      text?: string;
      score?: number;
      gradedAt?: Date;
    }[];
  }[];
  semester: string;
  year: number;
  createdAt: Date;
  updatedAt: Date;
}

const courseSchema = new Schema<ICourse>(
  {
    code: {
      type: String,
      required: [true, "Course code is required"],
      uppercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, "Course name is required"],
      maxlength: [200, "Course name cannot exceed 200 characters"],
    },
    description: {
      type: String,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    instructor: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Instructor is required"],
    },
    students: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    materials: [
      {
        title: { type: String, required: true },
        type: {
          type: String,
          enum: ["document", "video", "link", "assignment"],
          required: true,
        },
        url: { type: String, required: true },
        description: { type: String },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    announcements: [
      {
        type: Schema.Types.ObjectId,
        ref: "Announcement",
      },
    ],
    assignments: [
      {
        title: { type: String, required: true },
        description: { type: String },
        dueDate: { type: Date, required: true },
        maxScore: { type: Number, default: 100 },
        submissions: [
          {
            studentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
            submittedAt: { type: Date, default: Date.now },
            fileUrl: { type: String },
            text: { type: String },
            score: { type: Number },
            gradedAt: { type: Date },
          },
        ],
      },
    ],
    semester: {
      type: String,
      enum: ["Fall", "Spring", "Summer"],
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

courseSchema.index({ code: 1, semester: 1, year: 1 });
courseSchema.index({ instructor: 1 });
courseSchema.index({ students: 1 });

export default mongoose.model<ICourse>("Course", courseSchema);

