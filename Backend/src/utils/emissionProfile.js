// emissionProfile.js
// Simulation helpers for appliance usage and seasonal/daylight multipliers.
// Uses `hemishereMap` from the local utils (do not export the map here).

import hemisphereMap from "./hemishereMap.js";

const HOURS_IN_DAY = 24;

// Small multiplicative noise so patterns vary per-run
function addNoise(value, intensity = 0.05) {
  const factor = 1 + (Math.random() * 2 - 1) * intensity;
  return Math.max(0, value * factor);
}

// Backwards-compatible alias used by some older code
function withNoise(value, percent = 0.15) {
  // convert percent -> intensity roughly
  return addNoise(value, percent);
}

// Season-based multiplier using hemisphere mapping
function getSeasonalMultiplier(countryCode, month) {
  const code = String(countryCode || "").toUpperCase();
  const hemisphere = hemisphereMap[code] || "north";
  const winterMonths = {
    north: [11, 0, 1],
    south: [5, 6, 7],
    equator: [],
  };
  const summerMonths = {
    north: [5, 6, 7],
    south: [11, 0, 1],
    equator: [],
  };
  if (winterMonths[hemisphere].includes(month)) return 1.2;
  if (summerMonths[hemisphere].includes(month)) return 1.15;
  return 1.0;
}

// Hour-of-day multiplier: higher during typical waking/evening hours
function getDaylightHourMultiplier(hour) {
  if (hour >= 6 && hour < 9) return 0.8;
  if (hour >= 9 && hour < 17) return 1.0;
  if (hour >= 17 && hour < 21) return 1.1;
  return 0.6;
}

// Weekend usage tends to be slightly higher at home
function getWeekendMultiplier(dayOfWeek) {
  // 0 = Sunday, 6 = Saturday
  return dayOfWeek === 0 || dayOfWeek === 6 ? 1.1 : 1.0;
}

// Default average hours-per-day usage per appliance (with light noise)
function getDefaultApplianceUsage() {
  return {
    airConditioner: withNoise(6, 0.25),
    refrigerator: 24, // runs continuously but we model as 24h contribution
    washingMachine: withNoise(1, 0.3),
    tv: withNoise(4, 0.2),
    computer: withNoise(5, 0.3),
    fan: withNoise(10, 0.25),
    lights: withNoise(6, 0.2),
    vacuumCleaner: withNoise(0.5, 0.5),
    electricStove: withNoise(1.5, 0.2),
    microwave: withNoise(0.3, 0.4),
  };
}

// Typical average power draw (kW or kWh per hour when running)
const applianceEnergyRatings = {
  airConditioner: 1.5, // Kept. This is a very common rating for a 1.5-ton unit.[22, 2, 23]
  refrigerator: 0.045, // CORRECTED. User's 0.15kW (150W) @ 24h = 3.6 kWh/day (an inefficient 1990s model).[24]
  // A modern global average is ~1.1 kWh/day (e.g., 400 kWh/yr).[25, 26]
  // This 0.045kW (45W) is the *average* power draw over 24h to achieve that realistic daily consumption (1.1 kWh / 24h = ~0.045 kW).
  washingMachine: 0.5, // Kept. This represents the *motor* for a cold wash.[27] A hot wash or a machine with an internal heater (common in 230V regions) uses 2.0-2.5 kW.[28, 29]
  tv: 0.1, // Kept. This 100W is a solid average for a modern 50-55" LED TV (range 80-120W).[30, 31, 32]
  computer: 0.2, // Kept. This 200W is a standard value for a *complete desktop setup* (PC, monitor, speakers).[33, 34] Laptops are much lower (50-100W).[35]
  fan: 0.075, // CORRECTED. User's 0.05kW (50W) is an "in-between" value. The most common "normal" induction fans are 70-80W.[36, 37, 23] Efficient BLDC fans are 25-35W.[36, 38, 39] 75W is more representative of the dominant, older stock.
  lights: 0.06, // Kept. This 60W is a plausible *total average load* for an entire home fully converted to LEDs (e.g., 10-12 bulbs on at once).
  vacuumCleaner: 1.0, // Kept. This 1000W is a solid average. US models are often 1200-1500W [40, 41]; EU models are regulated to be lower.[42]
  electricStove: 2.0, // Kept. This 2000W is a standard rating for a single large burner or an induction cooktop.[15, 43, 44, 45]
  microwave: 1.2, // Kept. This 1200W is a plausible average. Note that *input* power (1400W) [46, 47] is often higher than *output* cooking power (900W).[46, 48]
};

// Usage windows define typical active hours for appliances. Each entry may be
// a single window [start, end) or an array of windows for multiple peaks.
const applianceUsageWindows = {
  airConditioner: [13, 23],
  refrigerator: [0, 24],
  washingMachine: [9, 17],
  tv: [18, 23],
  computer: [9, 20],
  fan: [10, 22],
  lights: [18, 23],
  vacuumCleaner: [10, 14],
  electricStove: [
    [7, 9],
    [18, 20],
  ],
  microwave: [
    [7, 9],
    [12, 14],
    [18, 20],
  ],
};

function normalizeWindows(windows) {
  // Ensure windows is an array of [start, end] ranges and split windows
  // that cross midnight into two ranges. Returns integer hour ranges.
  if (!windows) return [];
  const raw = Array.isArray(windows[0]) ? windows : [windows];
  const out = [];
  for (const w of raw) {
    if (!Array.isArray(w) || w.length < 2) continue;
    let start = Math.floor(Number(w[0]));
    let end = Math.floor(Number(w[1]));
    if (!Number.isFinite(start) || !Number.isFinite(end)) continue;
    // normalize into 0..24 range
    start = ((start % HOURS_IN_DAY) + HOURS_IN_DAY) % HOURS_IN_DAY;
    end = ((end % HOURS_IN_DAY) + HOURS_IN_DAY) % HOURS_IN_DAY;
    if (start === end) {
      // full day
      out.push([0, HOURS_IN_DAY]);
    } else if (start < end) {
      out.push([start, end]);
    } else {
      // window crosses midnight: split
      out.push([start, HOURS_IN_DAY]);
      out.push([0, end]);
    }
  }
  return out;
}

function getUsageDistribution(hours, shape = "flat") {
  // hours: array of [start, end] windows (e.g. [[7,9],[18,20]] or [13,23])
  const dist = new Array(HOURS_IN_DAY).fill(0);
  const windows = normalizeWindows(hours);
  if (!windows || windows.length === 0) return dist;

  if (shape === "flat") {
    for (const [start, end] of windows) {
      const span = Math.max(1, end - start);
      for (let i = start; i < end; i++) {
        dist[i % HOURS_IN_DAY] += 1 / span;
      }
    }
  } else if (shape === "peak") {
    // Gaussian-like peaks centered in each window
    for (const [start, end] of windows) {
      const span = Math.max(1, end - start);
      const mid = start + span / 2;
      const sigma = Math.max(1, span / 3);
      for (let i = start; i < end; i++) {
        const x = i + 0.5 - mid; // use center of hour
        const val = Math.exp((-0.5 * (x * x)) / (sigma * sigma));
        dist[i % HOURS_IN_DAY] += val;
      }
    }
  }

  // Normalize distribution to sum to 1 across 24 hours
  const sum = dist.reduce((a, b) => a + b, 0);
  if (sum <= 0) return dist;
  for (let i = 0; i < HOURS_IN_DAY; i++) dist[i] = dist[i] / sum;
  return dist;
}

export {
  addNoise,
  withNoise,
  getSeasonalMultiplier,
  getDaylightHourMultiplier,
  getWeekendMultiplier,
  getDefaultApplianceUsage,
  applianceEnergyRatings,
  applianceUsageWindows,
  getUsageDistribution,
};
