import * as authService from "../services/auth.service.js";
import ApiResponse from "../utils/ApiResponse.js";

// Cookie options for refresh token
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export const register = async (req, res, next) => {
  try {
    const { user, accessToken, refreshToken } = await authService.registerUser(
      req.body
    );

    res
      .status(201)
      .cookie("refreshToken", refreshToken, cookieOptions)
      .json(new ApiResponse(201, "User registered successfully", { user, accessToken }));
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { user, accessToken, refreshToken } = await authService.loginUser(
      req.body
    );

    res
      .cookie("refreshToken", refreshToken, cookieOptions)
      .json(new ApiResponse(200, "Login successful", { user, accessToken }));
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const incomingRefreshToken = req.cookies.refreshToken;
    const { accessToken, refreshToken } =
      await authService.refreshAccessToken(incomingRefreshToken);

    res
      .cookie("refreshToken", refreshToken, cookieOptions)
      .json(new ApiResponse(200, "Token refreshed", { accessToken }));
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    await authService.logoutUser(req.user._id);

    res
      .clearCookie("refreshToken", cookieOptions)
      .json(new ApiResponse(200, "Logged out successfully"));
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await authService.getCurrentUser(req.user._id);
    res.json(new ApiResponse(200, "User profile fetched", { user }));
  } catch (error) {
    next(error);
  }
};

export const updateMe = async (req, res, next) => {
  try {
    const user = await authService.updateUserProfile(req.user._id, req.body);
    res.json(new ApiResponse(200, "Profile updated", { user }));
  } catch (error) {
    next(error);
  }
};
