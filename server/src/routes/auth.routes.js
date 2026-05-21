import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";
import auth from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import { authLimiter } from "../middleware/rateLimiter.js";
import { z } from "zod";

const router = Router();

// Validation schemas
const registerSchema = z.object({
  name: z.string().min(1, "Name is required").max(50),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

const updateProfileSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  avatar: z.string().url().optional(),
  settings: z
    .object({
      timezone: z.string().optional(),
      workingHoursStart: z.number().min(0).max(23).optional(),
      workingHoursEnd: z.number().min(0).max(23).optional(),
      notificationsEnabled: z.boolean().optional(),
    })
    .optional(),
});

// Public routes
router.post("/register", authLimiter, validate(registerSchema), authController.register);
router.post("/login", authLimiter, validate(loginSchema), authController.login);
router.post("/refresh", authController.refresh);

// Protected routes
router.post("/logout", auth, authController.logout);
router.get("/me", auth, authController.getMe);
router.patch("/me", auth, validate(updateProfileSchema), authController.updateMe);

export default router;
