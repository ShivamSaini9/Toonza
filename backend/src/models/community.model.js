import mongoose, { Schema } from "mongoose";

const communitySchema = new Schema(
  {
    url: {
      type: String,
      required: true,
    },
    prompt: {
      type: String,
      required: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export const Community = mongoose.model("Community", communitySchema);
