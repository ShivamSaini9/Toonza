import mongoose, { Schema } from "mongoose";

const voiceGenerationSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
      maxlength: 5000,
    },
    voice: {
      type: String,
      enum: [
        "en-US-female",
        "en-US-male",
        "hi-IN-female",
        "hi-IN-male",
        "es-ES-female",
        "es-ES-male",
        "fr-FR-female",
        "fr-FR-male",
        "de-DE-female",
        "de-DE-male",
        "ja-JP-female",
        "ja-JP-male",
      ],
      required: true,
    },
    style: {
      type: String,
      enum: ["default", "calm", "energetic", "story"],
      default: "default",
    },
    audioUrl: {
      type: String,
      required: true,
    },
    cloudinaryPublicId: {
      type: String,
    },
    durationSeconds: {
      type: Number,
    },
  },
  { timestamps: true }
);

voiceGenerationSchema.index({ user: 1, createdAt: -1 });

export const VoiceGeneration = mongoose.model(
  "VoiceGeneration",
  voiceGenerationSchema
);
