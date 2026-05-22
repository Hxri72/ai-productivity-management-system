import { Router } from "express";
import * as notificationController from "../controllers/notification.controller.js";
import auth from "../middleware/auth.js";

const router = Router();

router.use(auth);

router.get("/", notificationController.getNotifications);
router.post("/check-deadlines", notificationController.checkDeadlines);
router.patch("/:id/read", notificationController.markAsRead);
router.patch("/read-all", notificationController.markAllAsRead);

export default router;
