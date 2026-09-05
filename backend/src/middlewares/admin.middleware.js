import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Must run AFTER verifyJWT so req.user is already populated from the DB.
// Role is re-checked against the DB on every request (not trusted from the
// JWT payload), so a demoted/suspended admin loses access immediately.
export const requireAdmin = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    throw new ApiError(401, "Unauthorized: No user on request");
  }

  if (req.user.isSuspended) {
    throw new ApiError(403, "Forbidden: Account suspended");
  }

  if (req.user.role !== "admin") {
    throw new ApiError(403, "Forbidden: Admin access required");
  }

  next();
});
