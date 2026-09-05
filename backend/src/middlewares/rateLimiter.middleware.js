import redisClient from "../config/redis.js";

const rateLimiter = async (req, res, next) => {
  try {
    const ip = req.ip;

    const key = `rate_limit:${ip}`;

    const requests = await redisClient.incr(key);

    if (requests === 1) {
      await redisClient.expire(key, 60);
    }

    if (requests > 10) {
      return res.status(429).json({
        success: false,
        message: "Too many requests. Please try again later.",
      });
    }

    next();
  } catch (error) {
    console.error("Rate limiter error:", error);

    // Don't break the API if Redis temporarily fails
    next();
  }
};

export default rateLimiter;
