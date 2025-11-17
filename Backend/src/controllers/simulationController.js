import Home from "../models/Home.js";
import HourlyEmission from "../models/HourlyEmission.js";
import simulateEmissions from "../services/simulationService.js";

/**
 * Simulate for a single home and persist the result.
 * @param {mongoose.Types.ObjectId|string} homeId
 * @param {Date|string} [date]
 */
export async function simulateAndSave(homeId, date = new Date()) {
  const home = await Home.findById(homeId).lean();
  if (!home) throw new Error("Home not found");

  // Build appliances map from home.appliances
  const appliances = home.appliances || {};

  // Home.emissionFactor is stored as gCO2/kWh; simulateEmissions expects kgCO2/kWh
  const emissionFactorKg = home.emissionFactor
    ? Number(home.emissionFactor) / 1000
    : 0.475; // fallback global average (kgCO2/kWh)

  const sim = simulateEmissions({
    appliances,
    countryCode: home.address?.country,
    date: date ? new Date(date) : new Date(),
    emissionFactor: emissionFactorKg,
  });

  // Normalize date to UTC midnight (same logic as HourlyEmission pre-save)
  const d = date ? new Date(date) : new Date();
  const utcDate = new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
  );

  // Upsert: prefer findOne + save to ensure pre-save hooks run and summary computed
  let doc = await HourlyEmission.findOne({ homeId, date: utcDate });
  if (doc) {
    doc.emissions = sim.emissions;
    doc.totalHourly = sim.totalHourly;
    // Ensure required summary fields are set so validation passes
    if (sim.summary) {
      doc.summary = {
        totalEmissions: Number(sim.summary.totalEmissions || 0),
        topAppliance: sim.summary.topAppliance || null,
      };
    }
    // save will run pre-save hooks to recompute summary
    await doc.save();
  } else {
    doc = await HourlyEmission.create({
      homeId,
      date: utcDate,
      emissions: sim.emissions,
      totalHourly: sim.totalHourly,
      summary: sim.summary
        ? {
            totalEmissions: Number(sim.summary.totalEmissions || 0),
            topAppliance: sim.summary.topAppliance || null,
          }
        : undefined,
    });
  }

  return doc;
}

// Express route handlers
export async function runSimulationForHome(req, res) {
  try {
    const { homeId, date } = req.body;
    if (!homeId) return res.status(400).json({ error: "homeId required" });
    const doc = await simulateAndSave(homeId, date);
    return res.json({ ok: true, doc });
  } catch (err) {
    console.error("runSimulationForHome error:", err);
    return res.status(500).json({ error: err.message || "Simulation failed" });
  }
}

export async function runSimulationForAll(req, res) {
  try {
    const { date } = req.body || {};
    const homes = await Home.find({}).select("_id").lean();
    const results = [];
    for (const h of homes) {
      try {
        // default to today (normalized) when not provided
        const doc = await simulateAndSave(h._id, date);
        results.push({ homeId: h._id, ok: true, id: doc._id });
      } catch (e) {
        results.push({ homeId: h._id, ok: false, error: e.message });
      }
    }
    return res.json({ ok: true, results });
  } catch (err) {
    console.error("runSimulationForAll error:", err);
    return res.status(500).json({ error: err.message || "Simulation failed" });
  }
}

export async function getLatestHourlyEmission(req, res) {
  try {
    const { homeId } = req.params;
    if (!homeId) return res.status(400).json({ error: "homeId required" });
    const doc = await HourlyEmission.findOne({ homeId })
      .sort({ date: -1 })
      .lean();
    if (!doc)
      return res
        .status(404)
        .json({ error: "No hourly emission found for home" });
    return res.json({ ok: true, doc });
  } catch (err) {
    console.error("getLatestHourlyEmission error:", err);
    return res
      .status(500)
      .json({ error: err.message || "Failed to fetch latest emission" });
  }
}

function normalizeDateToUTCDay(date) {
  const d = date ? new Date(date) : new Date();
  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
  );
}

// GET /api/simulation/hourly/:homeId?hour=15&date=YYYY-MM-DD
export async function getHourlyEmissionAt(req, res) {
  try {
    const { homeId } = req.params;
    if (!homeId) return res.status(400).json({ error: "homeId required" });

    // parse hour (0-23) or default to current UTC hour
    let hour =
      typeof req.query.hour !== "undefined" ? Number(req.query.hour) : null;
    if (Number.isNaN(hour) || hour === null) {
      hour = new Date().getUTCHours();
    }
    if (hour < 0 || hour > 23)
      return res.status(400).json({ error: "hour must be 0-23" });

    // parse date (optional) - if not provided use today (UTC)
    const dateParam = req.query.date;
    const date = normalizeDateToUTCDay(
      dateParam ? new Date(dateParam) : new Date()
    );

    const simulateIfMissing =
      String(req.query.simulate || "false").toLowerCase() === "true";
    const payload = await fetchHourlyEmissionAt(homeId, date, hour, {
      simulateIfMissing,
    });
    if (!payload)
      return res
        .status(404)
        .json({ error: "No hourly emission found for given date/home" });
    // normalize date to ISO in response
    payload.date = new Date(payload.date).toISOString();
    return res.json({ ok: true, ...payload });
  } catch (err) {
    console.error("getHourlyEmissionAt error:", err);
    return res
      .status(500)
      .json({ error: err.message || "Failed to fetch hourly emission" });
  }
}

/**
 * Fetch and build an hour-specific payload for a given home/date/hour.
 * Returns an object: { homeId, date, hour, total, perAppliance } or null if no doc.
 */
export async function fetchHourlyEmissionAt(
  homeId,
  date = null,
  hour = null,
  options = {}
) {
  // options: { simulateIfMissing: boolean }
  const { simulateIfMissing = false } = options || {};
  if (!homeId) throw new Error("homeId required");
  const targetDate = normalizeDateToUTCDay(date ? new Date(date) : new Date());
  const hourIndex =
    typeof hour === "number" && !Number.isNaN(hour)
      ? hour
      : new Date().getUTCHours();

  let doc = await HourlyEmission.findOne({ homeId, date: targetDate }).lean();
  if (!doc && simulateIfMissing) {
    try {
      await simulateAndSave(homeId, targetDate);
      doc = await HourlyEmission.findOne({ homeId, date: targetDate }).lean();
    } catch (e) {
      console.warn(
        `fetchHourlyEmissionAt: simulateAndSave failed for ${homeId} ${targetDate}:`,
        e.message
      );
      doc = null;
    }
  }
  if (!doc) return null;

  const perAppliance = {};
  const entries =
    doc.emissions instanceof Map
      ? Array.from(doc.emissions.entries())
      : Object.entries(doc.emissions || {});
  for (const [appliance, arr] of entries) {
    const val = Array.isArray(arr) ? arr[hourIndex] || 0 : 0;
    perAppliance[appliance] = Number(
      typeof val === "number" ? val.toFixed(2) : Number(val)
    );
  }

  const total = Array.isArray(doc.totalHourly)
    ? Number((doc.totalHourly[hourIndex] || 0).toFixed(2))
    : null;

  return {
    homeId,
    date: doc.date,
    hour: hourIndex,
    total,
    perAppliance,
  };
}
