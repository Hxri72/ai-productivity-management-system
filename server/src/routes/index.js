import { Router } from "express";
import authRoutes from "./auth.routes.js";
import taskRoutes from "./task.routes.js";
import aiRoutes from "./ai.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/tasks", taskRoutes);
router.use("/ai", aiRoutes);

// Future routes will be added here:
// router.use("/analytics", analyticsRoutes);
// router.use("/notifications", notificationRoutes);

export default router;
