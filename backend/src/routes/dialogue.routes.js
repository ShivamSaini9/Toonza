import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { separateDialogue } from "../controllers/dialogue.controller.js";

const router = Router();

router.route("/separate").post(verifyJWT, separateDialogue);

export default router;
