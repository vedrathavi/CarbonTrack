import dashboardService from "../services/dashboardService.js";
import Home from "../models/Home.js";
import mongoose from "mongoose";

export async function getToday(req, res) {
  try {
    const { homeId } = req.params;
    if (!homeId) return res.status(400).json({ error: "homeId required" });
    // Resolve identifier (accept homeCode or ObjectId)
    let resolved;
    if (mongoose.Types.ObjectId.isValid(String(homeId))) resolved = new mongoose.Types.ObjectId(String(homeId));
    else {
      const h = await Home.findOne({ homeCode: String(homeId) }).select("_id").lean();
      if (!h) return res.status(404).json({ error: "Home not found" });
      resolved = h._id;
    }

    // Authorization: require membership
    const homeDoc = await Home.findById(resolved).lean();
    if (!homeDoc) return res.status(404).json({ error: "Home not found" });
    if (!req.user || !homeDoc.members || !homeDoc.members.some(m => String(m.userId) === String(req.user._id))) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const data = await dashboardService.getTodayForHome(resolved);
    if (!data) return res.status(404).json({ error: "No data for today" });
    return res.json({ ok: true, data });
  } catch (err) {
    console.error("dashboard.getToday error:", err);
    return res.status(500).json({ error: err.message || "failed" });
  }
}

export async function getWeek(req, res) {
  try {
    const { homeId } = req.params;
    if (!homeId) return res.status(400).json({ error: "homeId required" });
    let resolved;
    if (mongoose.Types.ObjectId.isValid(String(homeId))) resolved = new mongoose.Types.ObjectId(String(homeId));
    else {
      const h = await Home.findOne({ homeCode: String(homeId) }).select("_id").lean();
      if (!h) return res.status(404).json({ error: "Home not found" });
      resolved = h._id;
    }

    const homeDoc = await Home.findById(resolved).lean();
    if (!homeDoc) return res.status(404).json({ error: "Home not found" });
    if (!req.user || !homeDoc.members || !homeDoc.members.some(m => String(m.userId) === String(req.user._id))) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const data = await dashboardService.getRangeForHome(resolved, 7);
    return res.json({ ok: true, data });
  } catch (err) {
    console.error("dashboard.getWeek error:", err);
    return res.status(500).json({ error: err.message || "failed" });
  }
}

export async function getMonth(req, res) {
  try {
    const { homeId } = req.params;
    if (!homeId) return res.status(400).json({ error: "homeId required" });
    let resolved;
    if (mongoose.Types.ObjectId.isValid(String(homeId))) resolved = new mongoose.Types.ObjectId(String(homeId));
    else {
      const h = await Home.findOne({ homeCode: String(homeId) }).select("_id").lean();
      if (!h) return res.status(404).json({ error: "Home not found" });
      resolved = h._id;
    }

    const homeDoc = await Home.findById(resolved).lean();
    if (!homeDoc) return res.status(404).json({ error: "Home not found" });
    if (!req.user || !homeDoc.members || !homeDoc.members.some(m => String(m.userId) === String(req.user._id))) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const data = await dashboardService.getRangeForHome(resolved, 30);
    return res.json({ ok: true, data });
  } catch (err) {
    console.error("dashboard.getMonth error:", err);
    return res.status(500).json({ error: err.message || "failed" });
  }
}

export async function getComparison(req, res) {
  try {
    const { homeId } = req.params;
    if (!homeId) return res.status(400).json({ error: "homeId required" });
    const days = req.query.days ? Number(req.query.days) : 7;

    let resolved;
    if (mongoose.Types.ObjectId.isValid(String(homeId))) resolved = new mongoose.Types.ObjectId(String(homeId));
    else {
      const h = await Home.findOne({ homeCode: String(homeId) }).select("_id").lean();
      if (!h) return res.status(404).json({ error: "Home not found" });
      resolved = h._id;
    }

    const homeDoc = await Home.findById(resolved).lean();
    if (!homeDoc) return res.status(404).json({ error: "Home not found" });
    if (!req.user || !homeDoc.members || !homeDoc.members.some(m => String(m.userId) === String(req.user._id))) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const data = await dashboardService.getComparison(resolved, days);
    return res.json({ ok: true, data });
  } catch (err) {
    console.error("dashboard.getComparison error:", err);
    return res.status(500).json({ error: err.message || "failed" });
  }
}

export default { getToday, getWeek, getMonth, getComparison };
