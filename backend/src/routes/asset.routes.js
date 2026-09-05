import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { listAssets, registerDownload } from "../controllers/asset.controller.js";

const router = Router();

// Member-facing library. Kept behind login (not public) so it stays
// tied to the account/credits system like the rest of the app.
router.route("/").get(verifyJWT, listAssets);
router.route("/:id/download").post(verifyJWT, registerDownload);

export default router;
