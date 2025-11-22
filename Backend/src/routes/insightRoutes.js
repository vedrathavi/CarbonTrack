import express from "express";
import { getLatest, generateForHome } from "../controllers/insightController.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

// Public (but requires auth to view via verifyToken middleware in app)
router.get("/:homeId/latest", verifyToken, getLatest);

// Protected: trigger generation for a home
router.post("/generate/:homeId", verifyToken, generateForHome);

export default router;
