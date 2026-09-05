import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { connectRedis } from "./config/redis.js";
import express from "express";
import app from "./app.js";

dotenv.config({ path: "./.env" });
// const app = express();

connectRedis();
connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.error("MONGO db connection failed!!!", error);
  });
