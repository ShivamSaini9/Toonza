import { Worker } from "bullmq";
import generateImageService from "../services/image-generation.service.js";
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

    const result = await generateImageService({
      userId: job.data.userId,
      prompt: job.data.prompt,
      style: job.data.style,
      isPublic: job.data.isPublic,
      ratio: job.data.ratio,
      count: job.data.count,
    });

    return result;
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
