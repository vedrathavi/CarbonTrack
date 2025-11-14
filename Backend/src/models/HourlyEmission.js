import mongoose from "mongoose";

const { Schema } = mongoose;
const HOURS_IN_DAY = 24;

function isHourlyArray(arr) {
  if (!Array.isArray(arr)) return false;
  if (arr.length !== HOURS_IN_DAY) return false;
  return arr.every(
    (v) => typeof v === "number" && Number.isFinite(v) && v >= 0
  );
}

function normalizeDateToUTCDay(date) {
  const d = date ? new Date(date) : new Date();
  const y = d.getUTCFullYear();
  const m = d.getUTCMonth();
  const day = d.getUTCDate();
  return new Date(Date.UTC(y, m, day, 0, 0, 0, 0));
}

const hourlyEmissionSchema = new Schema(
  {
    homeId: {
      type: Schema.Types.ObjectId,
      ref: "Home",
      required: true,
      index: true,
    },

    // Normalized to UTC midnight (start of day)
    date: {
      type: Date,
      required: true,
      index: true,
    },

    // Map of applianceKey -> [24 numbers] (hourly CO2 in grams)
    emissions: {
      type: Map,
      of: [Number],
      required: true,
      validate: {
        validator(map) {
          if (!map) return false;
          const values =
            map instanceof Map ? Array.from(map.values()) : Object.values(map);
          if (!values || values.length === 0) return false;
          return values.every(isHourlyArray);
        },
        message:
          "Each appliance must have an array of 24 numeric hourly values (non-negative).",
      },
    },

    // totalHourly: sum across appliances for each hour (length 24)
    totalHourly: {
      type: [Number],
      required: true,
      validate: {
        validator: isHourlyArray,
        message: "totalHourly must be an array of 24 non-negative numbers.",
      },
    },

    // Minimal summary (keep only required/canonical fields here)
    summary: {
      totalEmissions: {
        type: Number, // grams per day
        required: true,
        min: 0,
      },
      // keep these optional and small — detailed AI suggestions live in EmissionInsight
      topAppliance: {
        type: String,
        default: null,
      },
    },
  },
  { timestamps: true }
);

// Unique: one document per home per day
hourlyEmissionSchema.index({ homeId: 1, date: 1 }, { unique: true });

// Pre-save: normalize date and compute totals/summary if missing.
hourlyEmissionSchema.pre("save", function (next) {
  try {
    // Normalize date to UTC midnight
    if (this.isModified("date") || !this.date) {
      this.date = normalizeDateToUTCDay(this.date || new Date());
    }

    // Defensive: compute totalHourly from emissions if missing or emissions changed
    const emissionsMap =
      this.emissions instanceof Map
        ? this.emissions
        : new Map(Object.entries(this.emissions || {}));
    const totalHourly = new Array(HOURS_IN_DAY).fill(0);
    const applianceTotals = {};

    for (const [appliance, arr] of emissionsMap.entries()) {
      if (!isHourlyArray(arr)) continue;
      let apSum = 0;
      for (let h = 0; h < HOURS_IN_DAY; h++) {
        const v = Number(arr[h]) || 0;
        totalHourly[h] += v;
        apSum += v;
      }
      applianceTotals[appliance] = apSum;
    }

    if (!isHourlyArray(this.totalHourly) || this.isModified("emissions")) {
      this.totalHourly = totalHourly;
    }

    const totalEmissions = this.totalHourly.reduce(
      (a, b) => a + (Number(b) || 0),
      0
    );
    this.summary = this.summary || {};
    this.summary.totalEmissions = totalEmissions;

    const entries = Object.entries(applianceTotals);
    if (entries.length > 0) {
      entries.sort((a, b) => b[1] - a[1]);
      this.summary.topAppliance = entries[0][0];
    } else {
      this.summary.topAppliance = this.summary.topAppliance || null;
    }

    next();
  } catch (err) {
    next(err);
  }
});

const HourlyEmission = mongoose.model("HourlyEmission", hourlyEmissionSchema);
export default HourlyEmission;
