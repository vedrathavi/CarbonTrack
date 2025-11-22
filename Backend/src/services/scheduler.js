import cron from "node-cron";
import Home from "../models/Home.js";
import HourlyEmission from "../models/HourlyEmission.js";
import { simulateAndSave } from "../controllers/simulationController.js";
import insightService from "./insightService.js";

function normalizeToUTCDate(d = new Date()) {
  const dt = new Date(d);
  return new Date(
    Date.UTC(dt.getUTCFullYear(), dt.getUTCMonth(), dt.getUTCDate())
  );
}

/**
 * Initialize scheduled jobs.
 * - Daily job at 00:05 UTC: generate daily simulations for today
 * - Hourly job at minute 0: emit saved HourlyEmission (today or latest) for each home via provided `io`
 */
export function initScheduler() {
  // Daily at 00:00 IST -> simulate TODAY for all homes
  cron.schedule(
    "30 18 * * *",
    async () => {
      console.log(
        "[scheduler] daily job started (00:00 IST): simulating today"
      );
      try {
        const homes = await Home.find({}).select("_id").lean();
        const date = normalizeToUTCDate(new Date());
        for (const h of homes) {
          try {
            await simulateAndSave(h._id, date);
            try {
              // Generate insights after simulation for each home
              await insightService.generateAndStoreInsights(h._id, {});
            } catch (ie) {
              console.error("[scheduler] generateAndStoreInsights error for home", h._id, ie?.message || ie);
            }
          } catch (e) {
            console.error(
              "[scheduler] simulateAndSave error for home",
              h._id,
              e.message
            );
          }
        }
        console.log("[scheduler] daily simulation finished");
      } catch (err) {
        console.error("[scheduler] daily job error:", err);
      }
    },
    { timezone: "UTC" }
  );

  // Hourly job retained for bookkeeping but does not emit realtime updates
  cron.schedule(
    "0 * * * *",
    async () => {
      console.log("[scheduler] hourly job started (no realtime emit)");
      try {
        // Currently we don't emit realtime updates; keep this slot for future tasks.
        // If needed, we could perform light maintenance here.
        console.log("[scheduler] hourly job finished");
      } catch (err) {
        console.error("[scheduler] hourly job error:", err);
      }
    },
    { timezone: "UTC" }
  );

  console.log("[scheduler] initialized (daily @00:05 UTC, hourly @ minute 0)");
}
