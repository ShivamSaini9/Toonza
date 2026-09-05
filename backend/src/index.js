import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { connectRedis } from "./config/redis.js";
import app from "./app.js";

dotenv.config({ path: "./.env" });

connectRedis();

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 4000, "0.0.0.0", () => {
      console.log(`Server is running on port ${process.env.PORT || 4000}`);
    });
  })
  .catch((error) => {
    console.error("MONGO db connection failed!!!", error);
  });
