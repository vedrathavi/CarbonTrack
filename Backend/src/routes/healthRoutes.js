import express from "express";

const router = express.Router();

/**
 * Protected wake endpoint to prevent cold starts
 * Requires SCHEDULER_API_KEY in request header
 */
router.get("/wake", (req, res) => {
  const apiKey = req.headers["x-api-key"];
  const expectedKey = process.env.SCHEDULER_API_KEY;

  if (!expectedKey) {
    console.error("[health/wake] SCHEDULER_API_KEY not configured in environment");
    return res.status(500).json({ error: "Server misconfiguration" });
  }

  if (!apiKey || apiKey !== expectedKey) {
    console.warn("[health/wake] Unauthorized access attempt");
    return res.status(401).json({ error: "Unauthorized" });
  }

  console.log("[health/wake] Server woken up successfully");
  res.json({
    status: "awake",
    timestamp: new Date().toISOString(),
    message: "Server is ready for scheduled tasks"
  });
});

export default router;
