import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";


export const redirectIfAuthenticated = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return next();
    }
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    return res.redirect("/dashboard");
  } catch (err) {
    return next();
  }

});

// export const  redirectIfAuthenticated = asyncHandler(async(req, res, next) => {
//   const token = req.cookies?.accessToken;

//   if (!token) return next();

//   try {
//     jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
//     return res.redirect("/dashboard");
//   } catch (err) {
//     return next();
//   }
// });


