import express from "express";
import verifyToken from "../middleware/verifyToken.js";
import {
  createHome,
  joinHome,
  getMyHome,
  updateHome,
  getHomeStats,
  getHomeMembers,
} from "../controllers/homeController.js";

const router = express.Router();

// Protect all routes after this middleware
router.use(verifyToken);

// Home routes
router.post("/", createHome);
router.post("/join", joinHome);
router.get("/me", getMyHome);
router.patch("/", updateHome);
router.get("/stats", getHomeStats);
router.get("/members", getHomeMembers);

export default router;
