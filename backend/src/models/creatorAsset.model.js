import mongoose, { Schema } from "mongoose";

const creatorAssetSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["background", "bgm", "sfx"],
      required: true,
      index: true,
    },
    category: {
      type: String,
      trim: true,
      default: "General",
      index: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    url: {
      type: String,
      required: true,
    },
    cloudinaryPublicId: {
      type: String,
    },
    thumbnailUrl: {
      type: String,
    },
    // audio-only metadata
    durationSeconds: {
      type: Number,
    },
    fileSizeKb: {
      type: Number,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    downloadCount: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

creatorAssetSchema.index({ title: "text", category: "text", tags: "text" });

export const CreatorAsset = mongoose.model("CreatorAsset", creatorAssetSchema);
