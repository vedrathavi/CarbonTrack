import EmissionFactor from "../models/EmissionFactor.js";
import axios from "axios";

const CLIMATIQ_API_URL = process.env.CLIMATIQ_API_URL; // e.g. https://api.climatiq.io/data/v1/estimate
const CLIMATIQ_API_KEY = process.env.CLIMATIQ_API_KEY;

// Fetch emission factor for a country, cache in DB if not found
export const getEmissionFactor = async (req, res) => {
  const { country } = req.query;
  if (!country) {
    return res.status(400).json({ message: "Country is required" });
  }

  // Try local DB first
  let factorDoc = await EmissionFactor.findOne({ country });
  if (factorDoc) {
    return res.json({
      factor: factorDoc.factor,
      source: "local",
      unit: "gCO2/kWh",
    });
  }

  // Fetch from Climatiq API using /data/v1/estimate endpoint
  if (!CLIMATIQ_API_URL || !CLIMATIQ_API_KEY) {
    return res.status(500).json({ message: "Climatiq API not configured" });
  }

  try {
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

    const response = await axios.post(CLIMATIQ_API_URL, body, axiosConfig);
    const kgCO2e = response.data?.co2e;

    if (typeof kgCO2e !== "number") {
      return res
        .status(404)
        .json({ message: "Emission factor not found from Climatiq API" });
    }

    // Convert kg to grams
    const factor = kgCO2e * 1000;

    // Save to DB for future (country-level cache)
    factorDoc = await EmissionFactor.create({
      country,
      factor,
    });

    return res.json({ factor, source: "climatiq", unit: "gCO2/kWh" });
  } catch (err) {
    return res.status(500).json({
      message: "Error fetching emission factor",
      error: err?.response?.data || err.message,
    });
  }
};
