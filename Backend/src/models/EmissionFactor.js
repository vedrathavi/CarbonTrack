import mongoose from "mongoose";

const emissionFactorSchema = new mongoose.Schema(
  {
    country: { type: String, required: true },
    factor: { type: Number, required: true }, // gCO2/kWh (stored as float/decimal)
  },
  { timestamps: true }
);

emissionFactorSchema.index({ country: 1 }, { unique: true });

const EmissionFactor = mongoose.model("EmissionFactor", emissionFactorSchema);

export default EmissionFactor;
