import mongoose from "mongoose";

const { Schema } = mongoose;

function normalizeDateToUTCDay(date) {
  const d = date ? new Date(date) : new Date();
  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
  );
}

const insightSchema = new Schema(
  {
    homeId: {
      type: Schema.Types.ObjectId,
      ref: "Home",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["anomaly", "improvement", "milestone", "suggestion", "curiosity"],
      required: true,
      index: true,
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, default: null },
    impactLevel: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "low",
    },
    tags: { type: [String], default: [] },
    // generatedAt will be normalized to UTC-midnight for daily uniqueness/grouping
    generatedAt: { type: Date, required: true, index: true },
    // sourceId is an optional stable identifier for the insight (from model or generated hash)
    sourceId: { type: String, index: true },
  },
  { timestamps: true }
);

// Ensure uniqueness per home/day/sourceId (sourceId is set per-insight by the generator)
insightSchema.index(
  { homeId: 1, sourceId: 1, generatedAt: 1 },
  { unique: true }
);

// Normalize generatedAt to UTC day before save
insightSchema.pre("save", function (next) {
  try {
    if (this.generatedAt) {
      this.generatedAt = normalizeDateToUTCDay(this.generatedAt);
    } else {
      this.generatedAt = normalizeDateToUTCDay(new Date());
    }
    next();
  } catch (err) {
    next(err);
  }
});

const Insight = mongoose.model("Insight", insightSchema);
export default Insight;
