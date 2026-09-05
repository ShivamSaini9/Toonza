import { uploadAIBufferToCloudinary } from "../utils/cloudinary.js";
import { ImageGroup } from "../models/imageGroup.model.js";
import { Community } from "../models/community.model.js";
import { InferenceClient } from "@huggingface/inference";
import redisClient from "../config/redis.js";
import { User } from "../models/user.model.js";

const styleMap = {
  Realistic:
    "photorealistic, natural lighting, ultra-real detail, DSLR quality",

  Anime: "anime style, vibrant colors, clean line art, studio ghibli inspired",

  Cartoon: "cartoon style, bold outlines, exaggerated features, playful colors",

  Illustration: "digital illustration, painterly strokes, artistic shading",

  Storybook:
    "storybook style illustration, soft painterly art, whimsical fantasy, pastel color palette, digital painting",
};

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

const generateImageService = async ({
  userId,
  prompt,
  style,
  isPublic,
  ratio,
  count,
}) => {
  console.log("Starting image generation service...");
  console.log("User:", userId);
  console.log("Prompt:", prompt);
  console.log("Style:", style);
  console.log("Ratio:", ratio);
  console.log("Count:", count);

  // --------------------------------------------------
  // 1. Find user
  // --------------------------------------------------

  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  console.log("Generation user:", user._id);
  console.log("User credits:", user.credits);

  // --------------------------------------------------
  // 2. Check credits
  // --------------------------------------------------

  if (user.credits <= 0) {
    throw new Error("Insufficient credits");
  }

  // --------------------------------------------------
  // 3. Create final prompt
  // --------------------------------------------------

  const Newprompt = `
  Create a high-quality image of: ${prompt}.
  Style: ${styleMap[style] || style}.
  No text, no watermark, no logo.
  `;

  // --------------------------------------------------
  // 4. Detect scene
  // --------------------------------------------------

  const scene = detectScene(prompt);

  console.log("Detected scene:", scene);
  console.log("Final prompt:", Newprompt);

  let buffer;

  // ==================================================
  // STORYBOOK
  // ==================================================

  if (style === "Storybook") {
    const storybookApiUrl =
      process.env.STORYBOOK_API_URL || "http://127.0.0.1:8000";

    // -----------------------------------------------
    // Generate through FastAPI
    // -----------------------------------------------

    const response = await fetch(`${storybookApiUrl}/generate`, {
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

    // -----------------------------------------------
    // Download generated image
    // -----------------------------------------------

    const imageResponse = await fetch(`${storybookApiUrl}/outputs/${filename}`);

    if (!imageResponse.ok) {
      throw new Error("Failed to fetch generated Storybook image");
    }

    const arrayBuffer = await imageResponse.arrayBuffer();

    buffer = Buffer.from(arrayBuffer);

    console.log("Storybook image downloaded:", buffer.length, "bytes");
  }

  // ==================================================
  // FLUX
  // ==================================================
  else {
    // -----------------------------------------------
    // Calculate dimensions
    // -----------------------------------------------

    const [w, h] = ratio.split(":").map(Number);

    const width = 1024;

    const height = Math.round((width * h) / w);

    // -----------------------------------------------
    // HuggingFace client
    // -----------------------------------------------

    const client = new InferenceClient(process.env.ACCESS_TOKEN);

    // -----------------------------------------------
    // Generate image
    // -----------------------------------------------

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

    buffer = Buffer.from(arrayBuffer);

    console.log("FLUX image generated:", buffer.length, "bytes");
  }

  // ==================================================
  // CLOUDINARY
  // ==================================================

  const cloudinaryResult = await uploadAIBufferToCloudinary(buffer);

  console.log("Image uploaded:", cloudinaryResult);

  const imageUrl = cloudinaryResult.secure_url;

  // ==================================================
  // IMAGE GROUP
  // ==================================================

  const today = new Date();

  today.setHours(0, 0, 0, 0);

  let imageGroup = await ImageGroup.findOne({
    user: userId,
    date: today,
  });

  if (!imageGroup) {
    imageGroup = await ImageGroup.create({
      user: userId,
      date: today,
      images: [],
    });
  }

  imageGroup.images.unshift({
    url: imageUrl,
    prompt: Newprompt,
    style,
    isPublic,
  });

  await imageGroup.save();

  console.log("ImageGroup saved successfully");

  // ==================================================
  // COMMUNITY
  // ==================================================

  if (isPublic) {
    await Community.create({
      userId,
      imageUrl,
      prompt: Newprompt,
      style,
    });

    await redisClient.del("community:public-images");

    console.log("Community image saved successfully");
  }

  // ==================================================
  // CREDIT
  // ==================================================

  user.credits -= 1;

  await user.save();

  console.log("Credit deducted. Remaining:", user.credits);

  // ==================================================
  // RESULT
  // ==================================================

  return {
    success: true,
    imageUrl,
    message:
      style === "Storybook"
        ? "Storybook image generated successfully"
        : "Image generated successfully",
  };
};

export default generateImageService;
