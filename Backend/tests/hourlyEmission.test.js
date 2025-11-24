/**
 * Test Suite: HourlyEmission Model
 * Categories:
 * 1. Valid Creation & Computed Fields
 * 2. Boundary & Partition Tests (single vs multi appliance, zero arrays)
 * 3. Validation / Intentional Failures (negative, wrong length, missing fields)
 * 4. Uniqueness Constraint (one per home per day)
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
import mongoose from "mongoose";
import HourlyEmission from "../src/models/HourlyEmission.js";
import Home from "../src/models/Home.js";
import User from "../src/models/User.js";

function makeArray(val = 1) {
  return Array.from({ length: 24 }, () => val);
}

let home;

beforeAll(async () => {
  await setupTestDB();
  const user = await User.create({ email: "hour@test.com" });
  home = await Home.create({
    address: { country: "US", state: "CA", city: "Test City" },
    totalRooms: 2,
    createdBy: user._id,
    members: [{ userId: user._id, role: "admin" }],
  });
});

afterAll(async () => {
  await teardownTestDB();
});

beforeEach(async () => {
  await clearTestDB();
  // recreate home because clear removes it
  const user = await User.create({ email: "hour@test.com" });
  home = await Home.create({
    address: { country: "US", state: "CA", city: "Test City" },
    totalRooms: 2,
    createdBy: user._id,
    members: [{ userId: user._id, role: "admin" }],
  });
});

describe("HourlyEmission - Valid Creation", () => {
  test("creates document and computes totalHourly & summary", async () => {
    const midday = new Date(Date.UTC(2025, 0, 15, 13, 45));
    const emissions = {
      refrigerator: makeArray(10),
      heater: makeArray(5),
    };
    // Provide placeholder totalHourly; should be recomputed
    const doc = await HourlyEmission.create({
      homeId: home._id,
      date: midday,
      emissions,
      totalHourly: makeArray(0),
      summary: { totalEmissions: 0 },
    });

    // Date normalized to UTC midnight
    expect(doc.date.getUTCHours()).toBe(0);
    expect(doc.date.getUTCMinutes()).toBe(0);

    expect(doc.totalHourly).toHaveLength(24);
    // Each hour should be sum (10+5 = 15)
    doc.totalHourly.forEach((v) => expect(v).toBe(15));

    // totalEmissions = 24 * 15 = 360
    expect(doc.summary.totalEmissions).toBe(360);
    expect(doc.summary.topAppliance).toBe("refrigerator");
  });

  test("single appliance partition", async () => {
    const emissions = { heater: makeArray(2) };
    const doc = await HourlyEmission.create({
      homeId: home._id,
      date: new Date(),
      emissions,
      totalHourly: makeArray(0),
      summary: { totalEmissions: 0 },
    });
    doc.totalHourly.forEach((v) => expect(v).toBe(2));
    expect(doc.summary.totalEmissions).toBe(48); // 24*2
    expect(doc.summary.topAppliance).toBe("heater");
  });
});

describe("HourlyEmission - Boundary & Zero Arrays", () => {
  test("accepts zero arrays (topAppliance may still be set)", async () => {
    const emissions = { refrigerator: makeArray(0) };
    const doc = await HourlyEmission.create({
      homeId: home._id,
      date: new Date(),
      emissions,
      totalHourly: makeArray(0),
      summary: { totalEmissions: 0 },
    });
    expect(doc.summary.totalEmissions).toBe(0);
    // Implementation chooses first appliance even if total 0
    expect(["refrigerator", null]).toContain(doc.summary.topAppliance);
  });

  test("handles mixed values", async () => {
    const arr = makeArray(0).map((_, i) => (i % 2 === 0 ? 3 : 0));
    const emissions = { heater: arr };
    const placeholder = makeArray(0);
    const doc = await HourlyEmission.create({
      homeId: home._id,
      date: new Date(),
      emissions,
      totalHourly: placeholder,
      summary: { totalEmissions: 0 },
    });
    const expectedHourSum = arr;
    expectedHourSum.forEach((v, i) => expect(doc.totalHourly[i]).toBe(v));
    expect(doc.summary.totalEmissions).toBe(arr.reduce((a, b) => a + b, 0));
  });
});

describe("HourlyEmission - Validation Failures", () => {
  test("rejects array wrong length (23)", async () => {
    const bad = Array.from({ length: 23 }, () => 1);
    const emissions = { heater: bad };
    await expect(
      HourlyEmission.create({
        homeId: home._id,
        date: new Date(),
        emissions,
        totalHourly: makeArray(0),
        summary: { totalEmissions: 0 },
      })
    ).rejects.toThrow();
  });

  test("rejects negative value", async () => {
    const bad = makeArray(1);
    bad[5] = -3;
    const emissions = { heater: bad };
    await expect(
      HourlyEmission.create({
        homeId: home._id,
        date: new Date(),
        emissions,
        totalHourly: makeArray(0),
        summary: { totalEmissions: 0 },
      })
    ).rejects.toThrow();
  });

  test("rejects missing homeId", async () => {
    const emissions = { heater: makeArray(1) };
    await expect(
      HourlyEmission.create({
        date: new Date(),
        emissions,
        totalHourly: makeArray(0),
        summary: { totalEmissions: 0 },
      })
    ).rejects.toThrow();
  });

  test("rejects missing emissions", async () => {
    await expect(
      HourlyEmission.create({
        homeId: home._id,
        date: new Date(),
        totalHourly: makeArray(0),
        summary: { totalEmissions: 0 },
      })
    ).rejects.toThrow();
  });

  test("rejects missing totalHourly (required)", async () => {
    const emissions = { heater: makeArray(1) };
    await expect(
      HourlyEmission.create({
        homeId: home._id,
        date: new Date(),
        emissions,
        summary: { totalEmissions: 0 },
      })
    ).rejects.toThrow();
  });
});

describe("HourlyEmission - Uniqueness", () => {
  test("rejects duplicate homeId+date document", async () => {
    const targetDate = new Date(Date.UTC(2025, 4, 10, 18));
    const emissions = { heater: makeArray(1) };
    await HourlyEmission.create({
      homeId: home._id,
      date: targetDate,
      emissions,
      totalHourly: makeArray(0),
      summary: { totalEmissions: 0 },
    });
    await expect(
      HourlyEmission.create({
        homeId: home._id,
        date: targetDate,
        emissions,
        totalHourly: makeArray(0),
        summary: { totalEmissions: 0 },
      })
    ).rejects.toThrow(); // duplicate key error
  });
});
