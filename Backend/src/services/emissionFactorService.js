import EmissionFactor from "../models/EmissionFactor.js";
import axios from "axios";

const CLIMATE_AQ_API_URL = process.env.CLIMATE_AQ_API_URL;

export async function getOrFetchEmissionFactor({ city, state, country }) {
  // Try local DB first
  let factorDoc = await EmissionFactor.findOne({ city, state, country });
  if (factorDoc) return factorDoc.factor;

  // Fetch from Climate AQ API
  try {
    const response = await axios.get(CLIMATE_AQ_API_URL, {
      params: { city, state, country },
    });
    const factor = response.data.factor;
    if (typeof factor !== "number") return null;
    // Save to DB for future
    await EmissionFactor.create({ city, state, country, factor });
    return factor;
  } catch (err) {
    return null;
  }
}
