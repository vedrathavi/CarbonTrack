import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import Home from "../src/models/Home.js";
import HourlyEmission from "../src/models/HourlyEmission.js";
import { simulateAndSave } from "../src/controllers/simulationController.js";

// Load .env from Backend root
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRootEnv = path.resolve(__dirname, "..", ".env");
dotenv.config({ path: projectRootEnv });
console.info("[backfill_emissions] Loaded .env from", projectRootEnv);

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error("MONGO_URI not set in environment. Aborting.");
  process.exit(1);
}

function normalizeDateToUTCDay(date) {
  const d = date ? new Date(date) : new Date();
  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
  );
}

function addDays(date, days) {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

async function main() {
  await mongoose.connect(MONGO_URI, { family: 4 });

  // Accept optional args: fromDate (YYYY-MM-DD) toDate (YYYY-MM-DD)
  const fromArg = process.argv[2];
  const toArg = process.argv[3];

  const today = normalizeDateToUTCDay(new Date());
  const defaultDays = 30;
  let end = toArg ? normalizeDateToUTCDay(new Date(toArg)) : addDays(today, -1); // default end = yesterday
  let start = fromArg
    ? normalizeDateToUTCDay(new Date(fromArg))
    : addDays(end, -defaultDays + 1);

  if (start > end) {
    console.error("Start date must be <= end date");
    process.exit(1);
  }

  const homes = await Home.find({}).select("_id").lean();
  if (!homes || homes.length === 0) {
    console.error("No homes found in DB. Nothing to backfill.");
    await mongoose.disconnect();
    return;
  }

  console.log(
    `[backfill_emissions] Backfilling for ${homes.length} homes from ${start
      .toISOString()
      .slice(0, 10)} to ${end.toISOString().slice(0, 10)}`
  );

  let created = 0;
  let skipped = 0;
  let failed = 0;

  for (const h of homes) {
    const homeId = h._id;
    for (let d = new Date(start); d <= end; d = addDays(d, 1)) {
      const target = normalizeDateToUTCDay(d);
      const existing = await HourlyEmission.findOne({
        homeId,
        date: target,
      }).lean();
      if (existing) {
        skipped++;
        continue;
      }
      try {
        await simulateAndSave(homeId, target);
        created++;
        // small delay to avoid overwhelming DB
        await new Promise((r) => setTimeout(r, 50));
      } catch (e) {
        console.error(
          "[backfill_emissions] simulateAndSave failed for",
          homeId,
          target.toISOString().slice(0, 10),
          e.message || e
        );
        failed++;
      }
    }
  }

  console.log(
    `[backfill_emissions] Completed. created=${created} skipped=${skipped} failed=${failed}`
  );
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
