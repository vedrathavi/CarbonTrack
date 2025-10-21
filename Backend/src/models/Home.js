import mongoose from "mongoose";
import { nanoid } from "nanoid";
import { HomeError } from "../utils/errors.js";

// Custom Error class for home-related errors
const homeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Home name is required"],
      trim: true,
    },
    homeCode: {
      type: String,
      unique: true,
      required: true,
    },
    address: {
      country: {
        type: String,
        required: [true, "Country is required"],
      },
      state: {
        type: String,
        required: [true, "State is required"],
      },
      city: {
        type: String,
        required: [true, "City is required"],
      },
    },
    totalRooms: {
      type: Number,
      required: [true, "Total rooms is required"],
      min: [1, "Must have at least 1 room"],
    },
    appliances: {
      airConditioner: {
        type: Number,
        default: 0,
        min: 0,
      },
      refrigerator: {
        type: Number,
        default: 0,
        min: 0,
      },
      washingMachine: {
        type: Number,
        default: 0,
        min: 0,
      },
      tv: {
        type: Number,
        default: 0,
        min: 0,
      },
      computer: {
        type: Number,
        default: 0,
        min: 0,
      },
      fan: {
        type: Number,
        default: 0,
        min: 0,
      },
      lights: {
        type: Number,
        default: 0,
        min: 0,
      },
      vacuumCleaner: {
        type: Number,
        default: 0,
        min: 0,
      },
      electricStove: {
        type: Number,
        default: 0,
        min: 0,
      },
      microwave: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
    members: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        role: {
          type: String,
          enum: ["admin", "member"],
          default: "member",
        },
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware to generate unique homeCode and handle admin
homeSchema.pre("save", async function (next) {
  try {
    // Only generate homeCode for new documents
    if (this.isNew) {
      // Add creator as admin
      const creatorMember = this.members.find(
        (member) => member.userId.toString() === this.createdBy.toString()
      );

      if (!creatorMember) {
        this.members.push({
          userId: this.createdBy,
          role: "admin",
        });
      }

      // Generate unique homeCode with retries
      let attempts = 0;
      const maxAttempts = 5;
      let isUnique = false;

      while (!isUnique && attempts < maxAttempts) {
        const generatedCode = nanoid(8);
        // Check if code exists
        const existing = await this.constructor.findOne({
          homeCode: generatedCode,
        });

        if (!existing) {
          this.homeCode = generatedCode;
          isUnique = true;
        }
        attempts++;
      }

      // If we couldn't generate a unique code after max attempts
      if (!isUnique) {
        throw new HomeError(
          "Failed to generate unique home code. Please try again.",
          "CODE_GENERATION_FAILED"
        );
      }
    }
    next();
  } catch (error) {
    next(error);
  }
});

// Static method to check if user is already in any home
homeSchema.statics.checkExistingMembership = async function (userId) {
  const existingHome = await this.findOne({
    "members.userId": userId,
  });

  if (existingHome) {
    throw new HomeError(
      "User is already a member of another home",
      "ALREADY_MEMBER"
    );
  }
};

// Method to check if a user is an admin of the home
homeSchema.methods.isAdmin = function (userId) {
  const member = this.members.find(
    (m) => m.userId.toString() === userId.toString()
  );
  return member && member.role === "admin";
};

// Method to check if a user is a member of the home
homeSchema.methods.isMember = function (userId) {
  return this.members.some((m) => m.userId.toString() === userId.toString());
};

// Method to add a new member
homeSchema.methods.addMember = async function (userId, role = "member") {
  // Check if user is already in another home
  await this.constructor.checkExistingMembership(userId);

  if (this.isMember(userId)) {
    throw new HomeError(
      "User is already a member of this home",
      "DUPLICATE_MEMBER"
    );
  }

  this.members.push({ userId, role });
  return this.save();
};

// Generate new home code with retry logic
homeSchema.methods.generateNewCode = async function () {
  let attempts = 0;
  const maxAttempts = 5;
  let isUnique = false;

  while (!isUnique && attempts < maxAttempts) {
    const generatedCode = nanoid(8);
    const existing = await this.constructor.findOne({
      homeCode: generatedCode,
    });

    if (!existing) {
      this.homeCode = generatedCode;
      isUnique = true;
      await this.save();
      return this;
    }
    attempts++;
  }

  throw new HomeError(
    "Failed to generate unique home code. Please try again.",
    "CODE_GENERATION_FAILED"
  );
};

// Static method to join home by homeCode
homeSchema.statics.joinByHomeCode = async function (homeCode, userId) {
  const home = await this.findOne({ homeCode });

  if (!home) {
    throw new HomeError("Invalid home code", "INVALID_CODE");
  }

  await home.addMember(userId);
  return home;
};

const Home = mongoose.model("Home", homeSchema);

export default Home;
