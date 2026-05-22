import { Router } from "express";
import * as analyticsController from "../controllers/analytics.controller.js";
import auth from "../middleware/auth.js";

const router = Router();

router.use(auth);

router.get("/overview", analyticsController.getOverview);
router.get("/productivity", analyticsController.getProductivity);
router.get("/categories", analyticsController.getCategoryDistribution);
router.get("/priorities", analyticsController.getPriorityDistribution);
router.get("/trends", analyticsController.getTrends);
router.get("/accuracy", analyticsController.getEstimationAccuracy);
router.get("/productive-day", analyticsController.getProductiveDay);

export default router;
