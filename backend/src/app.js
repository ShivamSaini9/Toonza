import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
const app = express();

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Toonza backend is healthy",
  });
});

// Routes would be added here
import userRouter from "./routes/user.routes.js";
import imageGroupRouter from "./routes/imageGroup.routes.js";
import voiceRouter from "./routes/voice.routes.js";
import imageEnhanceRouter from "./routes/imageEnhancer.routes.js";
import paymentRouter from "./routes/payment.routes.js";
import dialogueRouter from "./routes/dialogue.routes.js";
import assetRouter from "./routes/asset.routes.js";
import adminRouter from "./routes/admin.routes.js";
//routes declaration
app.use("/api/v1/users", userRouter);
app.use("/api/v1/imageGroup", imageGroupRouter);
app.use("/api/v1/voice", voiceRouter);
app.use("/api/v1/imageEnhancer", imageEnhanceRouter);
app.use("/api/v1/payment", paymentRouter);
app.use("/api/v1/dialogue", dialogueRouter);
app.use("/api/v1/assets", assetRouter);
app.use("/api/v1/admin", adminRouter);

export default app;
