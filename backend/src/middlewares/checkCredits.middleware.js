import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

const checkCredits = (cost) =>
  asyncHandler(async (req, res, next) => {
    if (!req.user || req.user.credits < cost) {
      throw new ApiError(402, "Insufficient credits");
    }
    next();
  });

export { checkCredits };
