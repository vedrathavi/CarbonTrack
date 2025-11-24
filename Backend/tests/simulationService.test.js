/**
 * Test Suite: simulationService simulateEmissions
 */
import { describe, test, expect } from "@jest/globals";
import simulateEmissions from "../src/services/simulationService.js";

describe("simulationService - simulateEmissions", () => {
  test("returns structures for given appliances", () => {
    const { emissions, totalHourly, summary } = simulateEmissions({
      appliances: { airConditioner: 1, refrigerator: 1 },
      countryCode: "US",
      emissionFactor: 0.5,
      date: new Date(Date.UTC(2025, 0, 10)),
    });
    expect(emissions.airConditioner).toHaveLength(24);
    expect(emissions.refrigerator).toHaveLength(24);
    expect(totalHourly).toHaveLength(24);
    const sumAC = emissions.airConditioner.reduce((a, b) => a + b, 0);
    const sumFridge = emissions.refrigerator.reduce((a, b) => a + b, 0);
    const summedRaw = totalHourly.reduce((a, b) => a + b, 0);
    const calcSum = Number((sumAC + sumFridge).toFixed(2));
    const reported = Number(summary.totalEmissions.toFixed(2));
    const summed = Number(summedRaw.toFixed(2));
    expect(Math.abs(calcSum - reported)).toBeLessThanOrEqual(0.05);
    expect(Math.abs(reported - summed)).toBeLessThanOrEqual(0.05);
    expect(["airConditioner", "refrigerator"]).toContain(summary.topAppliance);
  });

  test("ignores appliances with count 0", () => {
    const { emissions } = simulateEmissions({
      appliances: { airConditioner: 0, refrigerator: 1 },
    });
    expect(emissions.airConditioner).toBeUndefined();
    expect(emissions.refrigerator).toHaveLength(24);
  });
});
