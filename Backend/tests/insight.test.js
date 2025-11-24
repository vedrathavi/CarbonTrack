/**
 * Test Suite: Insight Model
 * Categories:
 * 1. Valid Creation & Date Normalization
 * 2. Uniqueness Index (homeId+sourceId+generatedAt)
 * 3. Validation Failures (missing required fields, invalid enums)
 * 4. Tag & Impact Defaults
 */
import {
  describe,
  test,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
} from "@jest/globals";
import { setupTestDB, teardownTestDB, clearTestDB } from "./setup.js";
import Insight from "../src/models/Insight.js";
import Home from "../src/models/Home.js";
import User from "../src/models/User.js";

let home;

beforeAll(async () => {
  await setupTestDB();
});

afterAll(async () => {
  await teardownTestDB();
});

beforeEach(async () => {
  await clearTestDB();
  const user = await User.create({ email: "insight@test.com" });
  home = await Home.create({
    address: { country: "US", state: "CA", city: "Test City" },
    totalRooms: 2,
    createdBy: user._id,
    members: [{ userId: user._id, role: "admin" }],
  });
});

describe("Insight Model - Valid Creation", () => {
  test("normalizes generatedAt to UTC midnight", async () => {
    const date = new Date(Date.UTC(2025, 4, 10, 15, 33));
    const ins = await Insight.create({
      homeId: home._id,
      type: "suggestion",
      title: "Reduce cooling peak",
      description: "Raise thermostat 2°C during peak hours.",
      generatedAt: date,
    });
    expect(ins.generatedAt.getUTCHours()).toBe(0);
    expect(ins.generatedAt.getUTCMinutes()).toBe(0);
  });

  test("applies default impactLevel low and empty tags", async () => {
    const ins = await Insight.create({
      homeId: home._id,
      type: "curiosity",
      title: "Coffee equivalence",
      description: "Your savings equal brewing 30 cups of coffee.",
      generatedAt: new Date(),
    });
    expect(ins.impactLevel).toBe("low");
    expect(Array.isArray(ins.tags)).toBe(true);
    expect(ins.tags.length).toBe(0);
  });
});

describe("Insight Model - Uniqueness", () => {
  test("rejects duplicate sourceId on same day", async () => {
    const baseDate = new Date(Date.UTC(2025, 6, 1, 12));
    await Insight.create({
      homeId: home._id,
      sourceId: "dup123",
      type: "suggestion",
      title: "Shift laundry",
      description: "Run after 9pm to move 1 kWh off-peak.",
      generatedAt: baseDate,
    });
    await expect(
      Insight.create({
        homeId: home._id,
        sourceId: "dup123",
        type: "suggestion",
        title: "Shift laundry again",
        description: "Duplicate entry test",
        generatedAt: baseDate,
      })
    ).rejects.toThrow();
  });
});

describe("Insight Model - Validation Failures", () => {
  test("missing homeId fails", async () => {
    await expect(
      Insight.create({
        type: "anomaly",
        title: "Spike detected",
        description: "Cooling load spiked 20% yesterday.",
        generatedAt: new Date(),
      })
    ).rejects.toThrow();
  });

  test("invalid type enum fails", async () => {
    await expect(
      Insight.create({
        homeId: home._id,
        type: "invalidType",
        title: "Bad",
        description: "Invalid type enum",
        generatedAt: new Date(),
      })
    ).rejects.toThrow();
  });

  test("missing title fails", async () => {
    await expect(
      Insight.create({
        homeId: home._id,
        type: "suggestion",
        description: "No title provided",
        generatedAt: new Date(),
      })
    ).rejects.toThrow();
  });

  test("missing description fails", async () => {
    await expect(
      Insight.create({
        homeId: home._id,
        type: "suggestion",
        title: "No description",
        generatedAt: new Date(),
      })
    ).rejects.toThrow();
  });
});
