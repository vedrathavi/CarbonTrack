import express from "express";
import dashboardController from "../controllers/dashboardController.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

// GET /api/dashboard/:homeId/today
router.get("/:homeId/today", verifyToken, dashboardController.getToday);
router.get("/:homeId/week", verifyToken, dashboardController.getWeek);
router.get("/:homeId/month", verifyToken, dashboardController.getMonth);
router.get("/:homeId/comparison", verifyToken, dashboardController.getComparison);

export default router;
