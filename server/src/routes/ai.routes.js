import { Router } from "express";
import * as aiController from "../controllers/ai.controller.js";
import auth from "../middleware/auth.js";

const router = Router();

// All AI routes are protected
router.use(auth);

router.post("/prioritize", aiController.prioritizeTasks);
router.post("/suggest", aiController.getRecommendations);
router.get("/logs", aiController.getAiLogs);

export default router;
