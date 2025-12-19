import mongoose, { Document, Schema } from "mongoose";
import * as bcrypt from "bcrypt";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  username: string;
  avatar?: string;
  bio?: string;
  followers: mongoose.Types.ObjectId[];
  following: mongoose.Types.ObjectId[];
  isEmailVerified: boolean;
  role: "student" | "faculty" | "club_organizer" | "admin";
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [50, "Name cannot be more than 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [30, "Username cannot be more than 30 characters"],
    },
    avatar: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      maxlength: [200, "Bio cannot be more than 200 characters"],
      default: "",
    },
    followers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    following: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ["student", "faculty", "club_organizer", "admin"],
      default: "student",
    },
  },
  {
    timestamps: true,
  },
);

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: unknown) {
    next(error as Error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error("Error comparing passwords");
  }
};

export default mongoose.model<IUser>("User", userSchema);
