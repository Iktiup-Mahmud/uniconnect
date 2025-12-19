import mongoose, { Document, Schema } from "mongoose";

export interface IConversation extends Document {
  participants: mongoose.Types.ObjectId[];
  type: "direct" | "group";
  groupName?: string;
  groupImage?: string;
  lastMessage?: mongoose.Types.ObjectId;
  lastMessageAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const conversationSchema = new Schema<IConversation>(
  {
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    type: {
      type: String,
      enum: ["direct", "group"],
      default: "direct",
    },
    groupName: {
      type: String,
    },
    groupImage: {
      type: String,
    },
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: "Message",
    },
    lastMessageAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

conversationSchema.index({ participants: 1 });
conversationSchema.index({ type: 1 });
conversationSchema.index({ lastMessageAt: -1 });

export default mongoose.model<IConversation>("Conversation", conversationSchema);

