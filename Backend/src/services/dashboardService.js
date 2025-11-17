import HourlyEmission from "../models/HourlyEmission.js";
import mongoose from "mongoose";
import Home from "../models/Home.js";

function normalizeDateToUTCDay(date) {
  const d = date ? new Date(date) : new Date();
  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
  );
}

// Accept either ObjectId or homeCode; return resolved ObjectId
async function resolveHomeId(identifier) {
  if (!identifier) throw new Error("homeId required");
  const asString = String(identifier);
  if (mongoose.Types.ObjectId.isValid(asString))
    return new mongoose.Types.ObjectId(asString);
  const h = await Home.findOne({ homeCode: asString }).select("_id").lean();
  if (!h) throw new Error("Home not found");
  return h._id;
}

// Sum per-appliance arrays into totals
function perApplianceTotals(emissions) {
  const result = {};
  const entries =
    emissions instanceof Map
      ? Array.from(emissions.entries())
      : Object.entries(emissions || {});
  for (const [k, arr] of entries) {
    const sum = Array.isArray(arr)
      ? arr.reduce((a, b) => a + (Number(b) || 0), 0)
      : 0;
    result[k] = Number(sum.toFixed(2));
  }
  return result;
}

export async function getTodayForHome(homeId, date = null) {
  const resolved = await resolveHomeId(homeId);
  const target = normalizeDateToUTCDay(date || new Date());
  const doc = await HourlyEmission.findOne({
    homeId: resolved,
    date: target,
  }).lean();
  if (!doc) return null;
  const perApp = perApplianceTotals(doc.emissions || {});
  return {
    homeId: resolved,
    summary: doc.summary || {},
    date: doc.date,
    totalHourly: doc.totalHourly || [],
    totalEmissions: Number((doc.summary?.totalEmissions ?? 0).toFixed(2)),
    topAppliance: doc.summary?.topAppliance || null,
    applianceTotals: perApp,
  };
}

export async function getRangeForHome(homeId, days = 7, endDate = null) {
  const resolved = await resolveHomeId(homeId);
  const end = normalizeDateToUTCDay(endDate || new Date());
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - (days - 1));

  const docs = await HourlyEmission.find({
    homeId: resolved,
    date: { $gte: start, $lte: end },
  })
    .sort({ date: 1 })
    .lean();

  const map = {};
  for (const d of docs) map[new Date(d.date).toISOString().slice(0, 10)] = d;

  const out = [];
  for (let i = 0; i < days; i++) {
    const day = new Date(start);
    day.setUTCDate(start.getUTCDate() + i);
    const key = day.toISOString().slice(0, 10);
    const d = map[key];
    if (d) {
      const total = Number(
        (
          d.summary?.totalEmissions ??
          (Array.isArray(d.totalHourly)
            ? d.totalHourly.reduce((a, b) => a + (Number(b) || 0), 0)
            : 0)
        ).toFixed(2)
      );
      out.push({
        date: d.date,
        total,
        topAppliance: d.summary?.topAppliance || null,
      });
    } else {
      out.push({ date: day, total: 0, topAppliance: null });
    }
  }

  const sufficient = docs.length >= days;
  return { days, data: out, sufficient };
}

export async function getComparison(homeId, days = 7, endDate = null) {
  const resolved = await resolveHomeId(homeId);
  const end = normalizeDateToUTCDay(endDate || new Date());
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - (days - 1));

  // Fetch home docs for the range
  const homeDocs = await HourlyEmission.find({
    homeId: resolved,
    date: { $gte: start, $lte: end },
  }).lean();

  // Build a date-keyed bucket for the home over the full range (fill missing days with 0)
  const homeTotalsByDate = {};
  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setUTCDate(start.getUTCDate() + i);
    homeTotalsByDate[d.toISOString().slice(0, 10)] = 0;
  }
  for (const d of homeDocs) {
    const key = new Date(d.date).toISOString().slice(0, 10);
    const total =
      Number(
        d.summary?.totalEmissions ??
          (Array.isArray(d.totalHourly)
            ? d.totalHourly.reduce((a, b) => a + (Number(b) || 0), 0)
            : 0)
      ) || 0;
    homeTotalsByDate[key] = (homeTotalsByDate[key] || 0) + total;
  }
  const homeTotal = Object.values(homeTotalsByDate).reduce((a, b) => a + b, 0);
  const homeAvg = days > 0 ? Number((homeTotal / days).toFixed(2)) : 0;

  // Aggregate totals across all homes for the same date range (again fill missing days with 0)
  const allDocs = await HourlyEmission.find({
    date: { $gte: start, $lte: end },
  }).lean();
  const totalsByDate = {};
  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setUTCDate(start.getUTCDate() + i);
    totalsByDate[d.toISOString().slice(0, 10)] = 0;
  }
  for (const d of allDocs) {
    const key = new Date(d.date).toISOString().slice(0, 10);
    const total =
      Number(
        d.summary?.totalEmissions ??
          (Array.isArray(d.totalHourly)
            ? d.totalHourly.reduce((a, b) => a + (Number(b) || 0), 0)
            : 0)
      ) || 0;
    totalsByDate[key] = (totalsByDate[key] || 0) + total;
  }
  const globalTotal = Object.values(totalsByDate).reduce((a, b) => a + b, 0);
  const globalAvg = days > 0 ? Number((globalTotal / days).toFixed(2)) : 0;

  const sufficient = homeDocs.length >= days;
  return { homeAvg, globalAvg, days, sufficient };
}

export default { getTodayForHome, getRangeForHome, getComparison };
