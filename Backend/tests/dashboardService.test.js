/**
 * Test Suite: dashboardService
 * Focus: getTodayForHome, getRangeForHome, getComparison
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
import Home from "../src/models/Home.js";
import User from "../src/models/User.js";
import HourlyEmission from "../src/models/HourlyEmission.js";
import {
  getTodayForHome,
  getRangeForHome,
  getComparison,
} from "../src/services/dashboardService.js";

function arr(v) {
  return Array.from({ length: 24 }, () => v);
}

let homeA, homeB;

beforeAll(async () => {
  await setupTestDB();
});
afterAll(async () => {
  await teardownTestDB();
});
beforeEach(async () => {
  await clearTestDB();
  const u1 = await User.create({ email: "dash1@test.com" });
  const u2 = await User.create({ email: "dash2@test.com" });
  homeA = await Home.create({
    address: { country: "US", state: "CA", city: "A" },
    totalRooms: 2,
    createdBy: u1._id,
    members: [{ userId: u1._id, role: "admin" }],
  });
  homeB = await Home.create({
    address: { country: "US", state: "CA", city: "B" },
    totalRooms: 3,
    createdBy: u2._id,
    members: [{ userId: u2._id, role: "admin" }],
  });
});

describe("dashboardService - getTodayForHome", () => {
  test("returns null when no data", async () => {
    const res = await getTodayForHome(homeA._id);
    expect(res).toBeNull();
  });

  test("returns aggregated today data", async () => {
    const today = new Date();
    await HourlyEmission.create({
      homeId: homeA._id,
      date: today,
      emissions: { heater: arr(2), refrigerator: arr(1) },
      totalHourly: arr(0),
      summary: { totalEmissions: 0 },
    });
    const res = await getTodayForHome(homeA._id);
    expect(res).not.toBeNull();
    expect(res.totalHourly).toHaveLength(24);
    res.totalHourly.forEach((v) => expect(v).toBe(3));
    expect(res.totalEmissions).toBe(72); // 24*3
    expect(res.applianceTotals.heater).toBe(48); // 24*2
    expect(res.applianceTotals.refrigerator).toBe(24); // 24*1
    expect(res.topAppliance).toBe("heater");
  });
});

describe("dashboardService - getRangeForHome", () => {
  test("fills missing days with zeros", async () => {
    const today = new Date();
    const d0 = new Date(today);
    d0.setUTCDate(today.getUTCDate() - 2); // 2 days ago
    await HourlyEmission.create({
      homeId: homeA._id,
      date: d0,
      emissions: { heater: arr(1) },
      totalHourly: arr(0),
      summary: { totalEmissions: 0 },
    });
    const res = await getRangeForHome(homeA._id, 3, today);
    expect(res.days).toBe(3);
    expect(res.data).toHaveLength(3);
    // First element corresponds to start date (2 days ago) should have total 24
    expect(res.data[0].total).toBe(24);
    // Middle (1 day ago) missing -> 0
    expect(res.data[1].total).toBe(0);
    // Today missing -> 0
    expect(res.data[2].total).toBe(0);
    expect(res.sufficient).toBe(false); // only 1 doc present of 3
  });
});

describe("dashboardService - getComparison", () => {
  test("computes averages for single home vs global", async () => {
    const today = new Date();
    const days = 3;
    for (let i = 0; i < days; i++) {
      const d = new Date(today);
      d.setUTCDate(today.getUTCDate() - i);
      await HourlyEmission.create({
        homeId: homeA._id,
        date: d,
        emissions: { heater: arr(2) },
        totalHourly: arr(0),
        summary: { totalEmissions: 0 },
      });
    }
    // Add another home with half emissions
    for (let i = 0; i < days; i++) {
      const d = new Date(today);
      d.setUTCDate(today.getUTCDate() - i);
      await HourlyEmission.create({
        homeId: homeB._id,
        date: d,
        emissions: { heater: arr(1) },
        totalHourly: arr(0),
        summary: { totalEmissions: 0 },
      });
    }
    const res = await getComparison(homeA._id, days, today);
    // Home A daily total: 24*2 = 48 each day; average = 48
    expect(res.homeAvg).toBe(48);
    // Global total per day across both homes: 48 + 24 = 72, per-home daily average: 72/(2 homes) = 36
    expect(res.globalAvg).toBe(36);
    expect(res.sufficient).toBe(true);
  });
});
