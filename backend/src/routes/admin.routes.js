import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { requireAdmin } from "../middlewares/admin.middleware.js";
import { uploadAsset } from "../middlewares/assetUpload.middleware.js";
import {
  getOverview,
  getUsers,
  getUserById,
  setUserSuspension,
  updateUserCredits,
  updateUserRole,
  getTransactions,
  adminListAssets,
  createAsset,
  updateAsset,
  deleteAsset,
  getCommunityPosts,
  deleteCommunityPost,
} from "../controllers/admin.controller.js";

const router = Router();

// Every route below requires a valid session AND an admin role.
// This is enforced here in one place so no admin route can be added
// later without the guard by mistake.
router.use(verifyJWT, requireAdmin);

router.route("/overview").get(getOverview);

router.route("/users").get(getUsers);
router.route("/users/:id").get(getUserById);
router.route("/users/:id/suspend").patch(setUserSuspension);
router.route("/users/:id/credits").patch(updateUserCredits);
router.route("/users/:id/role").patch(updateUserRole);

router.route("/transactions").get(getTransactions);

router.route("/assets").get(adminListAssets).post(uploadAsset.single("file"), createAsset);
router.route("/assets/:id").patch(updateAsset).delete(deleteAsset);

router.route("/community").get(getCommunityPosts);
router.route("/community/:id").delete(deleteCommunityPost);

export default router;
