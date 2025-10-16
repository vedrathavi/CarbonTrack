import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // 🔐 Authentication Details
    name: { type: String, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, select: false }, // not returned by default
    googleId: { type: String, unique: true, sparse: true },
    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "google",
    },

    profilePic: { type: String },

    // 🏡 (Placeholder for future)
    householdId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Household",
    },
  },
  { timestamps: true }
);

// remove sensitive/internal fields when converting to JSON
userSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model("User", userSchema);
