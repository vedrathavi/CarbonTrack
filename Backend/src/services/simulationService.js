import {
  applianceEnergyRatings,
  getDefaultApplianceUsage,
  applianceUsageWindows,
  getSeasonalMultiplier,
  getWeekendMultiplier,
  getUsageDistribution,
  addNoise,
} from "../utils/emissionProfile.js";

const HOURS_IN_DAY = 24;

/**
 * Simulate per-appliance hourly emissions for a home on a given date.
 *
 * @param {Object} opts
 * @param {Object} opts.appliances - map of applianceKey -> count
 * @param {string} opts.countryCode - ISO country code for seasonal adjustments
 * @param {Date} [opts.date=new Date()] - date to simulate (UTC)
 * @param {number} [opts.emissionFactor=0.475] - kgCO2 per kWh
 * @returns {{ emissions: Object, totalHourly: number[], summary: Object }}
 */
function simulateEmissions({
  appliances = {},
  countryCode,
  date = new Date(),
  emissionFactor = 0.475,
} = {}) {
  const seasonalMultiplier = getSeasonalMultiplier(
    countryCode,
    date.getUTCMonth()
  );
  const weekendMultiplier = getWeekendMultiplier(date.getUTCDay());
  const applianceUsage = getDefaultApplianceUsage();

  const emissions = {};
  const totalHourly = new Array(HOURS_IN_DAY).fill(0);

  for (const [appliance, count] of Object.entries(appliances)) {
    if (!count || !applianceEnergyRatings[appliance]) continue;

    const energyPerHour = applianceEnergyRatings[appliance];
    const usageHours = applianceUsage[appliance] || 0;
    const windows = applianceUsageWindows[appliance] || [0, 24];

    // Heuristic: short or multiple windows -> 'peak', long single window -> 'flat'
    let shape = "flat";
    if (appliance !== "refrigerator") {
      const raw = Array.isArray(windows[0]) ? windows : [windows];
      let maxSpan = 0;
      for (const w of raw) {
        const s = Math.floor(w[0]);
        const e = Math.floor(w[1]);
        const span = (e - s + HOURS_IN_DAY) % HOURS_IN_DAY || HOURS_IN_DAY;
        if (span > maxSpan) maxSpan = span;
      }
      if (raw.length > 1 || maxSpan <= 6) shape = "peak";
    }

    const usageDist = getUsageDistribution(windows, shape);

    // Sanity check: allocated hours should approximately equal configured daily hours
    try {
      const allocated = usageDist.reduce((acc, p) => acc + p * usageHours, 0);
      if (
        Math.abs(allocated - usageHours) > Math.max(0.01, usageHours * 0.02)
      ) {
        console.warn(
          `simulateEmissions: allocated hours for ${appliance} differ from configured hours`,
          {
            appliance,
            usageHours,
            allocated: Number(allocated.toFixed(3)),
            shape,
            windows,
          }
        );
      }
    } catch (e) {
      // non-fatal
    }

    const hourlyData = new Array(HOURS_IN_DAY).fill(0).map((_, hour) => {
      const prob = usageDist[hour] || 0;
      const usageThisHour = prob * usageHours; // hours of runtime this hour
      const kWh = usageThisHour * energyPerHour * count; // kWh consumed this hour
      // apply seasonal/weekend multipliers to consumption, then convert to grams using emissionFactor (kgCO2/kWh)
      const grams =
        kWh * emissionFactor * 1000 * seasonalMultiplier * weekendMultiplier;
      const noisy = addNoise(grams, 0.1);
      totalHourly[hour] += noisy;
      return Number(noisy.toFixed(2));
    });

    emissions[appliance] = hourlyData;
  }

  const summary = {
    totalEmissions: Number(totalHourly.reduce((a, b) => a + b, 0).toFixed(2)),
    topAppliance:
      Object.entries(emissions)
        .map(([k, arr]) => [k, arr.reduce((a, b) => a + b, 0)])
        .sort(([, a], [, b]) => b - a)[0]?.[0] || null,
  };

  return {
    emissions,
    totalHourly: totalHourly.map((v) => Number(v.toFixed(2))),
    summary,
  };
}

export default simulateEmissions;
