import EmissionFactor from "../models/EmissionFactor.js";
import axios from "axios";

const CLIMATIQ_API_URL = process.env.CLIMATIQ_API_URL; // e.g. https://api.climatiq.io/data/v1/estimate
const CLIMATIQ_API_KEY = process.env.CLIMATIQ_API_KEY;

/**
 * Get emission factor (g CO2 / kWh) for a given country.
 * - Check local DB for country
 * - If not found, call Climatiq /data/v1/estimate for the country (country-level region)
 * - Returns number (gCO2/kWh) or null if not available
 */
export async function getOrFetchEmissionFactor({ country }) {
  if (!country) return null;

  // 1) Local DB lookup (country only)
  try {
    const doc = await EmissionFactor.findOne({ country });
    if (doc && typeof doc.factor === "number") return doc.factor;
  } catch (err) {
    console.warn("EmissionFactor DB lookup failed:", err.message);
  }

  // 2) Prepare Climatiq call (country-level only)
  if (!CLIMATIQ_API_URL || !CLIMATIQ_API_KEY) return null;

  const axiosConfig = {
    headers: {
      Authorization: `Bearer ${CLIMATIQ_API_KEY}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    timeout: 10000,
  };

  const body = {
    emission_factor: {
      activity_id: "electricity-supply_grid-source_supplier_mix",
      data_version: "^0",
      region: country,
    },
    parameters: {
      energy: 1,
      energy_unit: "kWh",
    },
  };

  try {
    const resp = await axios.post(CLIMATIQ_API_URL, body, axiosConfig);
    const data = resp.data;

    // Extract co2e (kg) and convert to gCO2/kWh
    const kg = data?.co2e;
    if (typeof kg === "number") {
      const factor = kg * 1000;

      // Save to DB for future lookups
      try {
        await EmissionFactor.create({
          country,
          factor,
        });
      } catch (dbErr) {
        // Non-blocking: log but don't fail if DB save fails (e.g., duplicate key)
        console.warn("Failed to cache emission factor in DB:", dbErr.message);
      }

      return factor;
    }
  } catch (err) {
    console.warn(
      "Climatiq request failed:",
      err?.response?.data || err?.message
    );
  }

  return null;
}
