import { Router } from "express";
import authRoutes from "./auth.routes.js";
import taskRoutes from "./task.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/tasks", taskRoutes);

// Future routes will be added here:
// router.use("/analytics", analyticsRoutes);
// router.use("/ai", aiRoutes);
// router.use("/notifications", notificationRoutes);

export default router;
