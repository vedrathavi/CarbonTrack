import Insight from "../models/Insight.js";
import Home from "../models/Home.js";
import mongoose from "mongoose";
import insightService from "../services/insightService.js";

// GET /api/insights/:homeId/latest?limit=10
export async function getLatest(req, res) {
  try {
    const { homeId } = req.params;
    if (!homeId) return res.status(400).json({ error: "homeId required" });

    let resolved;
    if (mongoose.Types.ObjectId.isValid(String(homeId)))
      resolved = new mongoose.Types.ObjectId(String(homeId));
    else {
      const h = await Home.findOne({ homeCode: String(homeId) })
        .select("_id")
        .lean();
      if (!h) return res.status(404).json({ error: "Home not found" });
      resolved = h._id;
    }

    const homeDoc = await Home.findById(resolved).lean();
    if (!homeDoc) return res.status(404).json({ error: "Home not found" });
    if (
      !req.user ||
      !homeDoc.members ||
      !homeDoc.members.some((m) => String(m.userId) === String(req.user._id))
    ) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const limit = req.query.limit ? Math.min(50, Number(req.query.limit)) : 10;
    const insights = await Insight.find({ homeId: resolved })
      .sort({ generatedAt: -1, createdAt: -1 })
      .limit(limit)
      .lean();
    return res.json({ ok: true, data: insights });
  } catch (err) {
    console.error("insight.getLatest error:", err);
    return res.status(500).json({ error: err.message || "failed" });
  }
}

// POST /api/insights/generate/:homeId  (protected)
export async function generateForHome(req, res) {
  try {
    const { homeId } = req.params;
    if (!homeId) return res.status(400).json({ error: "homeId required" });

    let resolved;
    if (mongoose.Types.ObjectId.isValid(String(homeId)))
      resolved = new mongoose.Types.ObjectId(String(homeId));
    else {
      const h = await Home.findOne({ homeCode: String(homeId) })
        .select("_id")
        .lean();
      if (!h) return res.status(404).json({ error: "Home not found" });
      resolved = h._id;
    }

    // Authorization: require membership
    const homeDoc = await Home.findById(resolved).lean();
    if (!homeDoc) return res.status(404).json({ error: "Home not found" });
    if (
      !req.user ||
      !homeDoc.members ||
      !homeDoc.members.some((m) => String(m.userId) === String(req.user._id))
    ) {
      return res.status(403).json({ error: "Forbidden" });
    }

    // Optional dashboard payload may be provided in body; otherwise service will fetch context
    const payload = req.body && Object.keys(req.body).length ? req.body : {};
    const saved = await insightService.generateAndStoreInsights(
      resolved,
      payload
    );
    return res.json({ ok: true, saved });
  } catch (err) {
    console.error("insight.generateForHome error:", err);
    return res.status(500).json({ error: err.message || "failed" });
  }
}

export default { getLatest, generateForHome };
