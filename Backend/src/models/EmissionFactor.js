import mongoose from "mongoose";

const emissionFactorSchema = new mongoose.Schema(
  {
    city: { type: String, required: true },
    state: { type: String },
    country: { type: String, required: true },
    factor: { type: Number, required: true }, // gCO2/kWh
  },
  { timestamps: true }
);

emissionFactorSchema.index({ city: 1, state: 1, country: 1 }, { unique: true });

const EmissionFactor = mongoose.model("EmissionFactor", emissionFactorSchema);

export default EmissionFactor;
