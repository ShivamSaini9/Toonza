import { Router } from "express";
import { imageEnhancer } from "../controllers/imageEnhancer.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { checkCredits } from "../middlewares/checkCredits.middleware.js";
// import { upload } from "../middlewares/multer.middleware.js";
// import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();

router
  .route("/enhance-image")
  .post(verifyJWT, checkCredits(1), upload.single("image"), imageEnhancer);

export default router;
