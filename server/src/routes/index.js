import { Router } from "express";
import authRoutes from "./auth.routes.js";

const router = Router();

router.use("/auth", authRoutes);

// Future routes will be added here:
// router.use("/tasks", taskRoutes);
// router.use("/analytics", analyticsRoutes);
// router.use("/ai", aiRoutes);
// router.use("/notifications", notificationRoutes);

export default router;
