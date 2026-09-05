import mongoose from "mongoose";
import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";
import { VoiceGeneration } from "../models/voiceGeneration.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  deleteFromCloudinary,
  uploadAudioBufferToCloudinary,
} from "../utils/cloudinary.js";

const voiceMap = {
  "en-US-female": "en-US-AriaNeural",
  "en-US-male": "en-US-GuyNeural",
  "hi-IN-female": "hi-IN-SwaraNeural",
  "hi-IN-male": "hi-IN-MadhurNeural",
  "es-ES-female": "es-ES-ElviraNeural",
  "es-ES-male": "es-ES-AlvaroNeural",
  "fr-FR-female": "fr-FR-DeniseNeural",
  "fr-FR-male": "fr-FR-HenriNeural",
  "de-DE-female": "de-DE-KatjaNeural",
  "de-DE-male": "de-DE-ConradNeural",
  "ja-JP-female": "ja-JP-NanamiNeural",
  "ja-JP-male": "ja-JP-KeitaNeural",
};

const styleOptions = {
  default: { rate: 1, pitch: "0Hz" },
  calm: { rate: 0.85, pitch: "0Hz" },
  energetic: { rate: 1.15, pitch: "+10Hz" },
  story: { rate: 0.95, pitch: "0Hz" },
};

const streamToBuffer = (stream) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.once("end", () => resolve(Buffer.concat(chunks)));
    stream.once("error", reject);
  });

const generateVoice = asyncHandler(async (req, res) => {
  const { text, style = "default", voice = "en-US-female" } = req.body;

  if (typeof text !== "string" || !text.trim()) {
    throw new ApiError(400, "text is required");
  }
  if (text.length > 5000) {
    throw new ApiError(400, "text must be 5000 characters or fewer");
  }
  if (!voiceMap[voice]) {
    throw new ApiError(400, "Unsupported voice selection");
  }
  if (!styleOptions[style]) {
    throw new ApiError(400, "Invalid voice style");
  }

  const tts = new MsEdgeTTS();
  await tts.setMetadata(
    voiceMap[voice],
    OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3
  );
  const { audioStream } = tts.toStream(text.trim(), styleOptions[style]);
  const audioBuffer = await streamToBuffer(audioStream);

  const uploadedAudio = await uploadAudioBufferToCloudinary(audioBuffer);
  if (!uploadedAudio?.secure_url) {
    throw new ApiError(500, "Voice upload failed");
  }

  // Deduct only after the audio is safely uploaded and ready to use.
  req.user.credits -= 1;
  await req.user.save();

  const generation = await VoiceGeneration.create({
    user: req.user._id,
    text: text.trim(),
    voice,
    style,
    audioUrl: uploadedAudio.secure_url,
    cloudinaryPublicId: uploadedAudio.public_id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, generation, "Voice generated successfully"));
});

const getVoiceHistory = asyncHandler(async (req, res) => {
  const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(
    Math.max(Number.parseInt(req.query.limit, 10) || 10, 1),
    50
  );
  const skip = (page - 1) * limit;
  const filter = { user: req.user._id };

  const [generations, total] = await Promise.all([
    VoiceGeneration.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    VoiceGeneration.countDocuments(filter),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        generations,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      "Voice history fetched successfully"
    )
  );
});

const deleteVoice = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new ApiError(400, "Invalid voice generation id");
  }

  const generation = await VoiceGeneration.findOne({
    _id: req.params.id,
    user: req.user._id,
  });
  if (!generation) {
    throw new ApiError(404, "Voice generation not found");
  }

  if (generation.cloudinaryPublicId) {
    await deleteFromCloudinary(generation.cloudinaryPublicId, "video");
  }
  await generation.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Voice generation deleted successfully"));
});

export { deleteVoice, generateVoice, getVoiceHistory };
