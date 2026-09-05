import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadAIBufferToCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ImageGroup } from "../models/imageGroup.model.js";
import { Community } from "../models/community.model.js";
import { InferenceClient } from "@huggingface/inference";
import redisClient from "../config/redis.js";
import imageQueue from "../queues/image.queue.js";
import generateImageService from "../services/image-generation.service.js";

import OpenAI from "openai";
import fs from "fs";
import path from "path";

const generateImage = asyncHandler(async (req, res) => {
  const { prompt, style, isPublic, ratio, count } = req.body;

  console.log(
    "Image generation request:",
    prompt,
    style,
    ratio,
    count,
    isPublic
  );

  const userId = req.user._id;

  // -----------------------------------------
  // 1. Validate prompt
  // -----------------------------------------

  if (!prompt || !prompt.trim()) {
    throw new ApiError(400, "Prompt is required");
  }

  // -----------------------------------------
  // 2. Validate credits
  // -----------------------------------------

  if (req.user.credits <= 0) {
    throw new ApiError(400, "Insufficient credits");
  }

  // -----------------------------------------
  // 3. Validate ratio
  // -----------------------------------------

  const allowedRatios = ["1:1", "16:9", "9:16", "4:3", "3:4"];

  if (ratio && !allowedRatios.includes(ratio)) {
    throw new ApiError(400, "Invalid image ratio");
  }

  const imageData = {
    userId: userId.toString(),
    prompt: prompt.trim(),
    style,
    isPublic: Boolean(isPublic),
    ratio: ratio || "1:1",
    count: count || 1,
  };

  // ==================================================
  // DEVELOPMENT / BULLMQ
  // ==================================================

  if (process.env.USE_BULLMQ === "true") {
    const job = await imageQueue.add("generate-image", imageData);

    console.log("Image generation job added:", job.id);

    return res.status(202).json(
      new ApiResponse(
        202,
        {
          jobId: job.id,
        },
        "Image generation job added to queue"
      )
    );
  }

  // ==================================================
  // PRODUCTION / DIRECT GENERATION
  // ==================================================

  const result = await generateImageService(imageData);

  return res.status(200).json(new ApiResponse(200, result, result.message));
});

const getImageJobStatus = asyncHandler(async (req, res) => {
  const { jobId } = req.params;

  const job = await imageQueue.getJob(jobId);

  if (!job) {
    throw new ApiError(404, "Job not found");
  }

  const state = await job.getState();

  const response = {
    jobId: job.id,
    status: state,
  };

  if (state === "completed") {
    response.result = job.returnvalue;
  }

  if (state === "failed") {
    response.error = job.failedReason;
  }

  return res
    .status(200)
    .json(new ApiResponse(200, response, "Job status fetched successfully"));
});

const getImages = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const imageGroups = await ImageGroup.find({
    user: userId,
  }).sort({ date: -1 }); // newest first (optional but recommended)

  return res
    .status(200)
    .json(new ApiResponse(200, imageGroups, "All images fetched successfully"));
});

const getPublicImages = asyncHandler(async (req, res) => {
  try {
    const cacheKey = "community:public-images";

    // 1. Check Redis cache
    const cachedPosts = await redisClient.get(cacheKey);

    if (cachedPosts) {
      console.log("🚀 Redis CACHE HIT");

      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            JSON.parse(cachedPosts),
            "All public images fetched from cache"
          )
        );
    }

    console.log("🐢 Redis CACHE MISS");

    // 2. Cache miss → MongoDB
    const posts = await Community.find()
      .populate("uploadedBy", "fullName avatar")
      .sort({ createdAt: -1 });

    // 3. Store result in Redis
    await redisClient.setEx(cacheKey, 60, JSON.stringify(posts));

    console.log("💾 Data stored in Redis");

    // 4. Return MongoDB result
    return res
      .status(200)
      .json(
        new ApiResponse(200, posts, "All public images fetched successfully")
      );
  } catch (error) {
    console.error("getPublicImages error:", error);
    res.status(500).json({ message: error.message });
  }
});

const upscaleImage = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, "Image file is required");

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const prompt =
    req.body.prompt ||
    `
Enhance this image while preserving the original artistic style.
Fix structure, perspective, and proportions.
Improve lighting, clarity, and composition.
High-quality professional illustration.
`;

  // ✅ Use fs.createReadStream with SINGLE file
  const result = await openai.images.edit({
    model: "gpt-image-1",
    image: fs.createReadStream(req.file.path), // ✔ THIS IS CORRECT
    prompt,
    size: "1024x1024",
  });

  const enhancedBuffer = Buffer.from(result.data[0].b64_json, "base64");

  const outputDir = "enhanced";
  fs.mkdirSync(outputDir, { recursive: true });

  const outputPath = path.join(outputDir, `enhanced_${Date.now()}.png`);
  fs.writeFileSync(outputPath, enhancedBuffer);

  fs.unlinkSync(req.file.path); // cleanup original upload

  res.json({ success: true, savedAt: outputPath });
});

export {
  generateImage,
  getImageJobStatus,
  getImages,
  getPublicImages,
  upscaleImage,
};

//PRODUCTION WAY
// const imageGroup = await ImageGroup.findOneAndUpdate(
//   { user: req.user.id, date },
//   {
//     $push: {
//       images: {
//         $each: [
//           {
//             url: imageUrl,
//             prompt,
//             style,
//           },
//         ],
//         $position: 0, // 👈 0 index pe add
//       },
//     },
//   },
//   {
//     new: true,
//     upsert: true, // 👈 agar date nahi hai to create kar dega
//   }
// );
