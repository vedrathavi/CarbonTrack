import cron from "node-cron";
import Home from "../models/Home.js";
import HourlyEmission from "../models/HourlyEmission.js";
import {
  simulateAndSave,
  fetchHourlyEmissionAt,
} from "../controllers/simulationController.js";

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
export function initScheduler({ io } = {}) {
  // Daily at 00:05 UTC -> simulate TODAY for all homes
  cron.schedule(
    "5 0 * * *",
    async () => {
      console.log(
        "[scheduler] daily job started (00:05 UTC): simulating today"
      );
      try {
        const homes = await Home.find({}).select("_id").lean();
        const date = normalizeToUTCDate(new Date());
        for (const h of homes) {
          try {
            await simulateAndSave(h._id, date);
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

  // Hourly at minute 0 -> emit saved HourlyEmission (today or most recent) to connected clients
  cron.schedule(
    "0 * * * *",
    async () => {
      console.log("[scheduler] hourly broadcast started");
      try {
        const homes = await Home.find({}).select("_id").lean();
        const today = normalizeToUTCDate(new Date());
        for (const h of homes) {
          try {
            // Use controller helper to fetch hour-specific payload (reuses same logic)
            const payload = await fetchHourlyEmissionAt(
              h._id,
              today,
              new Date().getUTCHours(),
              { simulateIfMissing: true }
            );
            if (payload && io) {
              io.to(`home_${h._id}`).emit("hourly-emission-update", payload);
            } else if (!payload) {
              console.debug(
                `[scheduler] no HourlyEmission available for home ${h._id}`
              );
            }
          } catch (e) {
            console.error(
              "[scheduler] hourly error for home",
              h._id,
              e.message
            );
          }
        }
        console.log("[scheduler] hourly broadcast finished");
      } catch (err) {
        console.error("[scheduler] hourly job error:", err);
      }
    },
    { timezone: "UTC" }
  );

  console.log("[scheduler] initialized (daily @00:05 UTC, hourly @ minute 0)");
}
