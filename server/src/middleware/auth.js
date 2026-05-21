import jwt from "jsonwebtoken";
import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import env from "../config/env.js";

const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new ApiError(401, "Access token is required");
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decoded.userId);
    if (!user) {
      throw new ApiError(401, "User not found");
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return next(new ApiError(401, "Invalid access token"));
    }
    if (error.name === "TokenExpiredError") {
      return next(new ApiError(401, "Access token expired"));
    }
    next(error);
  }
};

export default auth;
