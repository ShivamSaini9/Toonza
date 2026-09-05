import mongoose, { Schema } from "mongoose";

const imageSchema = new Schema(
  {
    url: {
      type: String,
      required: true,
    },
    prompt: {
      type: String,
      required: true,
    },
    style: {
      type: String,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const imageGroupSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    images: {
      type: [imageSchema],
      default: [],
    },
  },
  { timestamps: true }
);

imageGroupSchema.index({ user: 1, date: 1 }, { unique: true });

export const ImageGroup = mongoose.model("ImageGroup", imageGroupSchema);
