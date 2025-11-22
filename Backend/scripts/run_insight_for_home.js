import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import mongoose from "mongoose";
import insightService from "../src/services/insightService.js";
import Home from "../src/models/Home.js";

// Load .env from the Backend root reliably even when running from `scripts/`
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRootEnv = path.resolve(__dirname, "..", ".env");
dotenv.config({ path: projectRootEnv });
console.info("[run_insight_for_home] Loaded .env from", projectRootEnv);

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error("MONGO_URI not set in environment. Aborting.");
  process.exit(1);
}

async function main() {
  await mongoose.connect(MONGO_URI, { family: 4 });
  const arg = process.argv[2];
  let home = null;
  if (arg) home = await Home.findById(arg).lean();
  if (!home) {
    home = await Home.findOne({}).lean();
    if (!home) {
      console.error("No homes found in DB. Create one first.");
      process.exit(1);
    }
  }

  console.log("Running insight generation for home:", home._id);
  const saved = await insightService.generateAndStoreInsights(home._id, {});
  console.log("Saved insights:", saved);

  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
