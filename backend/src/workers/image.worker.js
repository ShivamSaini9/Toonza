import { Worker } from "bullmq";
import { uploadAIBufferToCloudinary } from "../utils/cloudinary.js";
import { ImageGroup } from "../models/imageGroup.model.js";
import { Community } from "../models/community.model.js";
import { InferenceClient } from "@huggingface/inference";
import redisClient from "../config/redis.js";
import { User } from "../models/user.model.js";
import connectDB from "../db/index.js";

await connectDB();

const redisUrl = new URL(process.env.REDIS_URL);

const redisConnection = {
  host: redisUrl.hostname,
  port: Number(redisUrl.port || 6379),
  username: redisUrl.username || undefined,
  password: redisUrl.password || undefined,
};

const imageWorker = new Worker(
  "image-generation",

  async (job) => {
    console.log("Processing image job:", job.id);
    console.log("Job data:", job.data);

    const { prompt, style, isPublic, ratio, count, userId } = job.data;

    // --------------------------------------------------
    // 1. Find user
    // --------------------------------------------------

    const user = await User.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    console.log("Worker user:", user._id);
    console.log("User credits:", user.credits);

    // --------------------------------------------------
    // 2. Check credits before generation
    // --------------------------------------------------

    if (user.credits <= 0) {
      throw new Error("Insufficient credits");
    }

    // --------------------------------------------------
    // 3. Style mapping
    // --------------------------------------------------

    const styleMap = {
      Realistic:
        "photorealistic, natural lighting, ultra-real detail, DSLR quality",

      Anime:
        "anime style, vibrant colors, clean line art, studio ghibli inspired",

      Cartoon:
        "cartoon style, bold outlines, exaggerated features, playful colors",

      Illustration: "digital illustration, painterly strokes, artistic shading",

      Storybook:
        "storybook style illustration, soft painterly art, whimsical fantasy, pastel color palette, digital painting",
    };

    // --------------------------------------------------
    // 4. Create final prompt
    // --------------------------------------------------

    const Newprompt = `
    Create a high-quality image of: ${prompt}.
    Style: ${styleMap[style] || style}.
    No text, no watermark, no logo.
    `;

    // --------------------------------------------------
    // 5. Scene detection
    // --------------------------------------------------

    const FOREST_KEYWORDS = [
      "forest",
      "jungle",
      "woods",
      "tree",
      "trees",
      "river",
      "mountain",
      "hill",
      "lake",
      "waterfall",
    ];

    const INTERIOR_KEYWORDS = [
      "room",
      "house",
      "home",
      "kitchen",
      "bedroom",
      "hall",
      "office",
      "inside",
      "interior",
    ];

    const detectScene = (text) => {
      const lowerText = text.toLowerCase();

      if (FOREST_KEYWORDS.some((word) => lowerText.includes(word))) {
        return "forest";
      }

      if (INTERIOR_KEYWORDS.some((word) => lowerText.includes(word))) {
        return "interior";
      }

      return "outdoor";
    };

    const scene = detectScene(prompt);

    console.log("Detected scene:", scene);
    console.log("Worker NewPrompt =", Newprompt);

    // ==================================================
    // STORYBOOK GENERATION
    // ==================================================

    if (style === "Storybook") {
      // ------------------------------------------------
      // 6. Call Storybook FastAPI service
      // ------------------------------------------------

      const response = await fetch("http://127.0.0.1:8000/generate", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          prompt: Newprompt,
          scene,
          negative_prompt: "",
        }),
      });

      if (!response.ok) {
        throw new Error(`Storybook generation failed: ${response.status}`);
      }

      const result = await response.json();

      console.log("Storybook API result:", result);

      const filename = result.filename;

      // ------------------------------------------------
      // 7. Download generated image
      // ------------------------------------------------

      const imageResponse = await fetch(
        `http://127.0.0.1:8000/outputs/${filename}`
      );

      if (!imageResponse.ok) {
        throw new Error("Failed to fetch generated Storybook image");
      }

      const arrayBuffer = await imageResponse.arrayBuffer();

      const buffer = Buffer.from(arrayBuffer);

      console.log("Storybook image downloaded:", buffer.length, "bytes");

      // ------------------------------------------------
      // 8. Upload to Cloudinary
      // ------------------------------------------------

      const cloudinaryResult = await uploadAIBufferToCloudinary(buffer);

      console.log("Storybook image uploaded:", cloudinaryResult);

      const imageUrl = cloudinaryResult.secure_url;

      // ------------------------------------------------
      // 9. Find today's ImageGroup
      // ------------------------------------------------

      const today = new Date();

      today.setHours(0, 0, 0, 0);

      let imageGroup = await ImageGroup.findOne({
        user: userId,
        date: today,
      });

      // ------------------------------------------------
      // 10. Create ImageGroup if necessary
      // ------------------------------------------------

      if (!imageGroup) {
        imageGroup = await ImageGroup.create({
          user: userId,
          date: today,
          images: [],
        });
      }

      // ------------------------------------------------
      // 11. Save image
      // ------------------------------------------------

      imageGroup.images.unshift({
        url: imageUrl,
        prompt: Newprompt,
        style,
        isPublic,
      });

      await imageGroup.save();

      console.log("Storybook ImageGroup saved successfully");

      // ------------------------------------------------
      // 12. Save to community if public
      // ------------------------------------------------

      if (isPublic) {
        await Community.create({
          userId,
          imageUrl,
          prompt: Newprompt,
          style,
        });

        await redisClient.del("community:public-images");

        console.log("Storybook community image saved successfully");
      }

      // ------------------------------------------------
      // 13. Deduct credit AFTER successful save
      // ------------------------------------------------

      user.credits -= 1;

      await user.save();

      console.log("Credit deducted. Remaining:", user.credits);

      // ------------------------------------------------
      // 14. Return job result
      // ------------------------------------------------

      return {
        success: true,
        imageUrl,
        message: "Storybook image generated successfully",
      };
    }

    // ==================================================
    // FLUX GENERATION
    // ==================================================

    // --------------------------------------------------
    // 6. Calculate image dimensions
    // --------------------------------------------------

    const [w, h] = ratio.split(":").map(Number);

    const width = 1024;

    const height = Math.round((width * h) / w);

    // --------------------------------------------------
    // 7. HuggingFace / Replicate client
    // --------------------------------------------------

    const client = new InferenceClient(process.env.ACCESS_TOKEN);

    // --------------------------------------------------
    // 8. Generate image
    // --------------------------------------------------

    const response = await client.textToImage({
      provider: "replicate",

      model: "black-forest-labs/FLUX.1-dev",

      inputs: Newprompt,

      parameters: {
        width,
        height,
        num_inference_steps: 28,
        guidance_scale: 6.5,
      },
    });

    const arrayBuffer = await response.arrayBuffer();

    const buffer = Buffer.from(arrayBuffer);

    console.log("FLUX image generated:", buffer.length, "bytes");

    // --------------------------------------------------
    // 9. Upload to Cloudinary
    // --------------------------------------------------

    const cloudinaryResult = await uploadAIBufferToCloudinary(buffer);

    console.log("FLUX image uploaded:", cloudinaryResult);

    const imageUrl = cloudinaryResult.secure_url;

    // --------------------------------------------------
    // 10. Find today's ImageGroup
    // --------------------------------------------------

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    let imageGroup = await ImageGroup.findOne({
      user: userId,
      date: today,
    });

    // --------------------------------------------------
    // 11. Create ImageGroup if necessary
    // --------------------------------------------------

    if (!imageGroup) {
      imageGroup = await ImageGroup.create({
        user: userId,
        date: today,
        images: [],
      });
    }

    // --------------------------------------------------
    // 12. Save generated image
    // --------------------------------------------------

    imageGroup.images.unshift({
      url: imageUrl,
      prompt: Newprompt,
      style,
      isPublic,
    });

    await imageGroup.save();

    console.log("FLUX ImageGroup saved successfully");

    // --------------------------------------------------
    // 13. Save to community if public
    // --------------------------------------------------

    if (isPublic) {
      await Community.create({
        userId,
        imageUrl,
        prompt: Newprompt,
        style,
      });

      await redisClient.del("community:public-images");

      console.log("FLUX community image saved successfully");
    }

    // --------------------------------------------------
    // 14. Deduct credit AFTER successful save
    // --------------------------------------------------

    user.credits -= 1;

    await user.save();

    console.log("Credit deducted. Remaining:", user.credits);

    // --------------------------------------------------
    // 15. Return job result
    // --------------------------------------------------

    return {
      success: true,
      imageUrl,
      message: "Image generated successfully",
    };
  },

  {
    connection: redisConnection,
  }
);

// ======================================================
// WORKER EVENTS
// ======================================================

imageWorker.on("completed", (job) => {
  console.log(`Job ${job.id} completed successfully`);
});

imageWorker.on("failed", (job, error) => {
  console.error(`Job ${job?.id} failed:`, error.message);
});

console.log("Image worker started...");
