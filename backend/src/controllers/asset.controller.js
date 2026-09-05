import { CreatorAsset } from "../models/creatorAsset.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// GET /api/v1/assets?type=bgm&category=Sad&search=rain&page=1&limit=20
// Public creator-facing library browse. Only published assets are shown.
const listAssets = asyncHandler(async (req, res) => {
  const { type, category, search, page = 1, limit = 24 } = req.query;

  const filter = { isPublished: true };
  if (type && ["background", "bgm", "sfx"].includes(type)) {
    filter.type = type;
  }
  if (category) {
    filter.category = category;
  }
  if (search) {
    filter.$text = { $search: search };
  }

  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(60, Math.max(1, Number(limit) || 24));

  const [assets, total, categories] = await Promise.all([
    CreatorAsset.find(filter)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .select("-cloudinaryPublicId"),
    CreatorAsset.countDocuments(filter),
    CreatorAsset.distinct("category", { isPublished: true }),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        assets,
        total,
        page: pageNum,
        totalPages: Math.max(1, Math.ceil(total / limitNum)),
        categories,
      },
      "Assets fetched successfully"
    )
  );
});

// POST /api/v1/assets/:id/download -> bumps download count, returns the url
const registerDownload = asyncHandler(async (req, res) => {
  const asset = await CreatorAsset.findByIdAndUpdate(
    req.params.id,
    { $inc: { downloadCount: 1 } },
    { new: true }
  );

  if (!asset) {
    throw new ApiError(404, "Asset not found");
  }

  return res.status(200).json(
    new ApiResponse(200, { url: asset.url }, "Download registered")
  );
});

export { listAssets, registerDownload };
