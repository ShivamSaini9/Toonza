import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const requireAuth = asyncHandler(async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken;

    if (!token) return res.redirect("/");

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = await User.findById(decoded._id).select("-password -refreshToken");

    if (!req.user) return res.redirect("/");

    next(); // allow access
  } catch {
    return res.redirect("/");
  }
});
