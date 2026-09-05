import { Queue } from "bullmq";

const redisUrl = new URL(process.env.REDIS_URL);

const redisConnection = {
  host: redisUrl.hostname,
  port: Number(redisUrl.port || 6379),
  username: redisUrl.username || undefined,
  password: redisUrl.password || undefined,
};

const imageQueue = new Queue("image-generation", {
  connection: redisConnection,
});

export default imageQueue;
