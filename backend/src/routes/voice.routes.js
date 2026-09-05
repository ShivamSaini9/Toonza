import { Router } from "express";
import {
  deleteVoice,
  generateVoice,
  getVoiceHistory,
} from "../controllers/aivoice.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { checkCredits } from "../middlewares/checkCredits.middleware.js";
// import { upload } from "../middlewares/multer.middleware.js";
// import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();

router.route("/generate-voice").post(verifyJWT, checkCredits(1), generateVoice);
router.route("/history").get(verifyJWT, getVoiceHistory);
router.route("/history/:id").delete(verifyJWT, deleteVoice);

export default router;
