import EmissionFactor from "../models/EmissionFactor.js";
import axios from "axios";

// Replace with your actual Climate AQ API endpoint
const CLIMATE_AQ_API_URL = process.env.CLIMATE_AQ_API_URL;

// Fetch emission factor for a city/region, cache in DB if not found
export const getEmissionFactor = async (req, res) => {
  const { city, state, country } = req.query;
  if (!city || !country) {
    return res.status(400).json({ message: "City and country are required" });
  }

  // Try local DB first
  let factorDoc = await EmissionFactor.findOne({ city, state, country });
  if (factorDoc) {
    return res.json({ factor: factorDoc.factor, source: "local" });
  }

  // Fetch from Climate AQ API
  try {
    const response = await axios.get(CLIMATE_AQ_API_URL, {
      params: { city, state, country },
    });
    const factor = response.data.factor;
    if (typeof factor !== "number") {
      return res
        .status(404)
        .json({ message: "Emission factor not found from API" });
    }
    // Save to DB for future
    factorDoc = await EmissionFactor.create({ city, state, country, factor });
    return res.json({ factor, source: "api" });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Error fetching emission factor", error: err.message });
  }
};
