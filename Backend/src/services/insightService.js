import Insight from "../models/Insight.js";
import Home from "../models/Home.js";
import HourlyEmission from "../models/HourlyEmission.js";
import gemini from "../utils/geminiClient.js";
import crypto from "crypto";

function normalizeDateToUTCDay(date = new Date()) {
  const d = new Date(date);
  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
  );
}

function buildCandidatesFromDashboard({ today, week, month, comparison } = {}) {
  const c = [];
  try {
    if (today && today.summary) {
      c.push({
        title: `Today's total: ${Number(
          today.summary.totalEmissions || 0
        ).toFixed(1)} g`,
      });
      if (today.topAppliance)
        c.push({ title: `Top appliance today: ${today.topAppliance}` });
    }
    if (week && Array.isArray(week.data)) {
      c.push({
        title: `Week total: ${
          week.total || week.data.reduce((s, d) => s + Number(d.total || 0), 0)
        } g`,
      });
    }
    if (month && Array.isArray(month.data)) {
      c.push({
        title: `Month daily average: ${
          month.avg?.toFixed ? month.avg.toFixed(1) : month.avg || 0
        } g`,
      });
    }
    if (comparison) {
      c.push({
        title: `Compared to global avg: home ${comparison.homeAvg} g vs global ${comparison.globalAvg} g`,
      });
    }
  } catch (e) {
    // best-effort
  }
  return c;
}

/**
 * Generate insights for a home using dashboard payload and store them.
 * @param {string|ObjectId} homeId
 * @param {Object} dashboardPayload - { today, week, month, comparison }
 * @returns {Promise<Array>} saved insights
 */
export async function generateAndStoreInsights(homeId, dashboardPayload = {}) {
  if (!homeId) throw new Error("homeId required");

  // Build lightweight home context
  let homeContext = null;
  try {
    const home = await Home.findById(homeId).lean();
    const recent = await HourlyEmission.find({ homeId })
      .sort({ date: -1 })
      .limit(7)
      .lean();
    homeContext = {
      homeId: String(home?._id || homeId),
      name: home?.name || null,
      address: home?.address || null,
      appliances: home?.appliances || {},
      emissionFactor: home?.emissionFactor || null,
      recentSummary: recent.length
        ? `Latest total ${Number(
            recent[0].summary?.totalEmissions || 0
          ).toFixed(1)} g, top: ${recent[0].summary?.topAppliance || "unknown"}`
        : "no recent data",
      recentCount: recent.length,
    };
  } catch (e) {
    homeContext = null;
  }

  const candidates = buildCandidatesFromDashboard(dashboardPayload || {});

  // Build prompt for Gemini
  const prompt = [];
  prompt.push(
    "You are an assistant that writes short, specific, human-friendly energy insights for a single-home dashboard. Output MUST be a JSON array only."
  );
  prompt.push(
    "Respond ONLY with a JSON array of insight objects. Do not include any additional explanation."
  );
  prompt.push(
    "Insight object shape: { id: string, type: 'anomaly'|'improvement'|'milestone'|'suggestion'|'curiosity', title: string, description: string, impactLevel?: 'low'|'medium'|'high', tags?: string[] }"
  );
  if (homeContext) {
    prompt.push(`Home: ${homeContext.name || ""}`);
    if (homeContext.address) {
      const { city, state, country } = homeContext.address || {};
      prompt.push(
        `Location: ${city || ""}${city ? ", " : ""}${state || ""}${
          state ? ", " : ""
        }${country || ""}`
      );
    }
    prompt.push(`Recent summary: ${homeContext.recentSummary}`);
  }
  if (candidates && candidates.length) {
    prompt.push("Candidates:");
    for (const c of candidates.slice(0, 8)) prompt.push(`- ${c.title || c}`);
  }
  prompt.push("Example output (must be a valid JSON array, no extra text):");
  prompt.push(`[
  {"id":"ex-1","type":"improvement","title":"You shaved 12% off your evening peak","description":"Nice — shifting laundry out of peak hours cut your evening usage. Keep it up!","impactLevel":"medium","tags":["behavior","evening"]},
  {"id":"ex-2","type":"curiosity","title":"Coffee-power fact","description":"That saving is enough to brew ~45 cups of coffee — imagine the coffee breaks!","impactLevel":"low","tags":["fun","equivalence"]},
  {"id":"ex-3","type":"suggestion","title":"Try a fridge check","description":"Your fridge is using a bit more than usual. A quick gasket check or de-ice could trim usage.","impactLevel":"low","tags":["appliance","fridge"]}
]`);
  prompt.push(
    "Produce up to 10 concise insights as the JSON array described above. Keep tone friendly, specific, sometimes witty. Avoid dates or extra commentary."
  );
  // Additional instruction to avoid vague or non-actionable language
  prompt.push(
    'Do NOT produce vague calls-to-action or filler phrases like "Let\'s see how much we can trim next", "Let\'s try", "Consider trying", or generic encouragements without specifics. Each insight MUST include at least one concrete, actionable item or measurable estimate (for example: "Increase thermostat by 2°C to save ~8% on cooling" or "Run laundry after 9pm to shift 1 kWh off-peak").'
  );
  // Brevity rules: force short titles and descriptions for UI fit
  prompt.push(
    'Brevity constraints: Titles MUST be <= 8 words. Descriptions MUST be 25 words or fewer and no more than 2 short sentences. Use terse actionable language (e.g. "Raise thermostat 2°C — ~8% cooling save"). Do NOT add extra explanation.'
  );

  const promptText = prompt.join("\n");
  console.info("[insightService] Prompt sent to Gemini:\n", promptText);

  // Call Gemini via SDK wrapper (utils/geminiClient.generateTextWithSDK)
  let rawOutput = null;
  try {
    rawOutput = await gemini.generateTextWithSDK(
      "gemini-2.5-flash",
      promptText
    );
  } catch (e) {
    console.warn("insightService: gemini SDK call failed", e?.message || e);
    rawOutput = null;
  }

  let insights = null;
  if (!rawOutput) {
    console.error(
      "[insightService] No output from Gemini SDK. This likely means the AI service is not configured or unavailable."
    );
    throw new Error("AI service unavailable");
  }

  // Attempt to parse JSON from the model output. If parsing fails, treat it as an AI error.
  const text = rawOutput.trim();
  try {
    insights = JSON.parse(text);
  } catch (e) {
    // Try to extract first JSON array substring
    const start = text.indexOf("[");
    const end = text.lastIndexOf("]");
    if (start !== -1 && end !== -1 && end > start) {
      try {
        const sub = text.substring(start, end + 1);
        insights = JSON.parse(sub);
      } catch (ee) {
        console.error(
          "[insightService] Failed to parse JSON from Gemini output. Raw output:",
          text
        );
        throw new Error("AI service returned invalid JSON");
      }
    } else {
      console.error(
        "[insightService] Failed to parse JSON from Gemini output. Raw output:",
        text
      );
      throw new Error("AI service returned invalid JSON");
    }
  }

  const normalizedDate = normalizeDateToUTCDay(new Date());

  const saved = [];
  // Ensure any legacy unique index on (homeId,type,generatedAt) is removed so multiple
  // insights of the same type can be stored. Attempt to drop the legacy index if present.
  try {
    // index name used by mongoose default: 'homeId_1_type_1_generatedAt_1'
    await Insight.collection.dropIndex("homeId_1_type_1_generatedAt_1");
    console.info(
      "[insightService] Dropped legacy unique index homeId_1_type_1_generatedAt_1"
    );
  } catch (e) {
    // Ignore if index not found; log other errors.
    const msg = String(e?.message || e);
    if (!/index not found|ns not found|can't find index/.test(msg)) {
      console.debug("[insightService] dropIndex skipped or failed:", msg);
    }
  }
  // Limit to first 10 insights to match prompt guidance
  for (const ins of (insights || []).slice(0, 10)) {
    try {
      const sourceSeed =
        ins.id || ins.title || ins.description || JSON.stringify(ins || {});
      const sourceId = crypto
        .createHash("sha1")
        .update(String(sourceSeed))
        .digest("hex")
        .slice(0, 16);

      const doc = {
        homeId,
        sourceId,
        type: ins.type || "suggestion",
        title: ins.title || ins.text || "Insight",
        description: ins.description || ins.text || "",
        icon: ins.icon || null,
        impactLevel: ins.impactLevel || "low",
        tags: ins.tags || [],
        generatedAt: ins.generatedAt
          ? normalizeDateToUTCDay(ins.generatedAt)
          : normalizedDate,
      };

      // Upsert by homeId + sourceId + generatedAt to avoid duplicates while allowing multiple
      // insights of the same `type` per day.
      const filter = {
        homeId: doc.homeId,
        sourceId: doc.sourceId,
        generatedAt: doc.generatedAt,
      };
      const updated = await Insight.findOneAndUpdate(
        filter,
        { $set: doc },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      saved.push(updated);
    } catch (e) {
      console.warn("insightService: failed saving insight", e?.message || e);
    }
  }

  return saved;
}

export default { generateAndStoreInsights };
