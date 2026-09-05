import { asyncHandler } from "../utils/asyncHandler.js";
import { Client } from "@gradio/client";
import fs from "fs/promises";

const imageEnhancer = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No image uploaded" });
  }

  // Read file from disk
  const imageBuffer = await fs.readFile(req.file.path);

  const client = await Client.connect(
    "finegrain/finegrain-image-enhancer",
    { hf_token: process.env.ACCESS_TOKEN } // optional
  );

  const result = await client.predict("/process", {
    input_image: imageBuffer,
    prompt: "high quality, detailed",
    negative_prompt: "low quality, blurry",
    upscale_factor: 2,
  });

  // ✅ Access enhanced image (after image)
  const afterImage = result.data[0][1];
  req.user.credits -= 1;
  await req.user.save();
  // Optional: cleanup temp file
  await fs.unlink(req.file.path);

  return res.json({ image: afterImage.url });
});

export { imageEnhancer };
