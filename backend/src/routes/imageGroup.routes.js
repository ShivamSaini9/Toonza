import { Router } from "express";
import {
  generateImage,
  getImageJobStatus,
  getImages,
  getPublicImages,
  upscaleImage,
} from "../controllers/ai.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { checkCredits } from "../middlewares/checkCredits.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import rateLimiter from "../middlewares/rateLimiter.middleware.js";
// import { upload } from "../middlewares/multer.middleware.js";
// import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();

router
  .route("/generate-image")
  .post(verifyJWT, rateLimiter, checkCredits(2), generateImage);
router.get("/job-status/:jobId", verifyJWT, getImageJobStatus);
router.route("/get-imageGroup").get(verifyJWT, getImages);
router.route("/get-publicImages").get(getPublicImages);
router.route("/upscale").post(upload.single("image"), upscaleImage);

export default router;
