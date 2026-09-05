import { User } from "../models/user.model.js";
import { PaymentTransaction } from "../models/paymentTransaction.model.js";
import { CreatorAsset } from "../models/creatorAsset.model.js";
import { Community } from "../models/community.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

// Keep this in sync with payment.controller.js's `plans` map.
// Transactions only store credits + plan name, not price, so revenue is
// derived from the plan's known price at read time.
const PLAN_PRICE_CENTS = {
  Starter: 500,
  Pro: 1500,
};

/* ---------------------------------- Overview ---------------------------------- */

const getOverview = asyncHandler(async (req, res) => {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    newUsersToday,
    newUsers7d,
    activeUsers7d,
    suspendedUsers,
    transactions,
    totalAssets,
    totalCommunityPosts,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ createdAt: { $gte: startOfToday } }),
    User.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
    User.countDocuments({ updatedAt: { $gte: sevenDaysAgo } }),
    User.countDocuments({ isSuspended: true }),
    PaymentTransaction.find().select("plan credits createdAt"),
    CreatorAsset.countDocuments(),
    Community.countDocuments(),
  ]);

  const revenueCents = transactions.reduce(
    (sum, t) => sum + (PLAN_PRICE_CENTS[t.plan] || 0),
    0
  );
  const revenue30dCents = transactions
    .filter((t) => t.createdAt >= thirtyDaysAgo)
    .reduce((sum, t) => sum + (PLAN_PRICE_CENTS[t.plan] || 0), 0);
  const creditsSold = transactions.reduce((sum, t) => sum + (t.credits || 0), 0);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        totalUsers,
        newUsersToday,
        newUsers7d,
        activeUsers7d,
        suspendedUsers,
        totalTransactions: transactions.length,
        revenue: revenueCents / 100,
        revenue30d: revenue30dCents / 100,
        creditsSold,
        totalAssets,
        totalCommunityPosts,
      },
      "Overview stats fetched"
    )
  );
});

/* ------------------------------------ Users ------------------------------------ */

const getUsers = asyncHandler(async (req, res) => {
  const { search = "", page = 1, limit = 20, role, status } = req.query;

  const filter = {};
  if (search) {
    filter.$or = [
      { fullName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }
  if (role && ["member", "admin"].includes(role)) {
    filter.role = role;
  }
  if (status === "suspended") filter.isSuspended = true;
  if (status === "active") filter.isSuspended = false;

  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(100, Math.max(1, Number(limit) || 20));

  const [users, total] = await Promise.all([
    User.find(filter)
      .select("-password -refreshToken")
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    User.countDocuments(filter),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      { users, total, page: pageNum, totalPages: Math.max(1, Math.ceil(total / limitNum)) },
      "Users fetched"
    )
  );
});

const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password -refreshToken");
  if (!user) throw new ApiError(404, "User not found");

  const transactions = await PaymentTransaction.find({ user: user._id }).sort({ createdAt: -1 });

  return res.status(200).json(new ApiResponse(200, { user, transactions }, "User fetched"));
});

const setUserSuspension = asyncHandler(async (req, res) => {
  const { suspended } = req.body;
  if (typeof suspended !== "boolean") {
    throw new ApiError(400, "`suspended` boolean is required");
  }

  if (req.params.id === req.user._id.toString()) {
    throw new ApiError(400, "You cannot suspend your own account");
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { $set: { isSuspended: suspended } },
    { new: true }
  ).select("-password -refreshToken");

  if (!user) throw new ApiError(404, "User not found");

  return res
    .status(200)
    .json(new ApiResponse(200, user, suspended ? "User suspended" : "User activated"));
});

const updateUserCredits = asyncHandler(async (req, res) => {
  const { credits, mode = "set" } = req.body;
  const numericCredits = Number(credits);

  if (Number.isNaN(numericCredits)) {
    throw new ApiError(400, "`credits` must be a number");
  }

  const update =
    mode === "add"
      ? { $inc: { credits: numericCredits } }
      : { $set: { credits: numericCredits } };

  const user = await User.findByIdAndUpdate(req.params.id, update, { new: true }).select(
    "-password -refreshToken"
  );

  if (!user) throw new ApiError(404, "User not found");
  if (user.credits < 0) {
    // roll back to zero rather than allowing negative balances
    user.credits = 0;
    await user.save({ validateBeforeSave: false });
  }

  return res.status(200).json(new ApiResponse(200, user, "Credits updated"));
});

const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  if (!["member", "admin"].includes(role)) {
    throw new ApiError(400, "`role` must be 'member' or 'admin'");
  }

  if (req.params.id === req.user._id.toString() && role !== "admin") {
    throw new ApiError(400, "You cannot demote your own account");
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { $set: { role } },
    { new: true }
  ).select("-password -refreshToken");

  if (!user) throw new ApiError(404, "User not found");

  return res.status(200).json(new ApiResponse(200, user, "Role updated"));
});

/* --------------------------------- Subscriptions --------------------------------- */

const getTransactions = asyncHandler(async (req, res) => {
  const { page = 1, limit = 25 } = req.query;
  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(100, Math.max(1, Number(limit) || 25));

  const [transactions, total] = await Promise.all([
    PaymentTransaction.find()
      .populate("user", "fullName email")
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    PaymentTransaction.countDocuments(),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      { transactions, total, page: pageNum, totalPages: Math.max(1, Math.ceil(total / limitNum)) },
      "Transactions fetched"
    )
  );
});

/* ----------------------------------- Assets ----------------------------------- */

const adminListAssets = asyncHandler(async (req, res) => {
  const { type, search, page = 1, limit = 30 } = req.query;
  const filter = {};
  if (type && ["background", "bgm", "sfx"].includes(type)) filter.type = type;
  if (search) filter.title = { $regex: search, $options: "i" };

  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(100, Math.max(1, Number(limit) || 30));

  const [assets, total] = await Promise.all([
    CreatorAsset.find(filter)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    CreatorAsset.countDocuments(filter),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      { assets, total, page: pageNum, totalPages: Math.max(1, Math.ceil(total / limitNum)) },
      "Assets fetched"
    )
  );
});

const createAsset = asyncHandler(async (req, res) => {
  const { title, type, category = "General", tags = "" } = req.body;

  if (!title || !type) {
    throw new ApiError(400, "Title and type are required");
  }
  if (!["background", "bgm", "sfx"].includes(type)) {
    throw new ApiError(400, "type must be background, bgm, or sfx");
  }

  const filePath = req.file?.path;
  if (!filePath) {
    throw new ApiError(400, "Asset file is required");
  }

  const uploaded = await uploadOnCloudinary(filePath);
  if (!uploaded?.url) {
    throw new ApiError(500, "Upload to Cloudinary failed");
  }

  const asset = await CreatorAsset.create({
    title,
    type,
    category,
    tags: typeof tags === "string" ? tags.split(",").map((t) => t.trim()).filter(Boolean) : tags,
    url: uploaded.url,
    cloudinaryPublicId: uploaded.public_id,
    durationSeconds: uploaded.duration,
    fileSizeKb: uploaded.bytes ? Math.round(uploaded.bytes / 1024) : undefined,
    uploadedBy: req.user._id,
  });

  return res.status(201).json(new ApiResponse(201, asset, "Asset uploaded"));
});

const updateAsset = asyncHandler(async (req, res) => {
  const { title, category, tags, isPublished } = req.body;
  const update = {};
  if (title !== undefined) update.title = title;
  if (category !== undefined) update.category = category;
  if (isPublished !== undefined) update.isPublished = isPublished;
  if (tags !== undefined) {
    update.tags = typeof tags === "string" ? tags.split(",").map((t) => t.trim()).filter(Boolean) : tags;
  }

  const asset = await CreatorAsset.findByIdAndUpdate(req.params.id, { $set: update }, { new: true });
  if (!asset) throw new ApiError(404, "Asset not found");

  return res.status(200).json(new ApiResponse(200, asset, "Asset updated"));
});

const deleteAsset = asyncHandler(async (req, res) => {
  const asset = await CreatorAsset.findByIdAndDelete(req.params.id);
  if (!asset) throw new ApiError(404, "Asset not found");

  return res.status(200).json(new ApiResponse(200, {}, "Asset deleted"));
});

/* ---------------------------------- Community ---------------------------------- */

const getCommunityPosts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 30 } = req.query;
  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(100, Math.max(1, Number(limit) || 30));

  const [posts, total] = await Promise.all([
    Community.find()
      .populate("uploadedBy", "fullName email")
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Community.countDocuments(),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      { posts, total, page: pageNum, totalPages: Math.max(1, Math.ceil(total / limitNum)) },
      "Community posts fetched"
    )
  );
});

const deleteCommunityPost = asyncHandler(async (req, res) => {
  const post = await Community.findByIdAndDelete(req.params.id);
  if (!post) throw new ApiError(404, "Post not found");
  return res.status(200).json(new ApiResponse(200, {}, "Post removed"));
});

export {
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
};
