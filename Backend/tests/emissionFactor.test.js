/**
 * Test Suite: EmissionFactor Model
 * Categories:
 * 1. Valid Creation
 * 2. Boundary Values (0, high)
 * 3. Uniqueness (country index)
 * 4. Required Field Failures
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
import EmissionFactor from "../src/models/EmissionFactor.js";

beforeAll(async () => {
  await setupTestDB();
});
afterAll(async () => {
  await teardownTestDB();
});
beforeEach(async () => {
  await clearTestDB();
});

describe("EmissionFactor - Valid Creation", () => {
  test("creates with typical factor", async () => {
    const ef = await EmissionFactor.create({ country: "US", factor: 450 });
    expect(ef.country).toBe("US");
    expect(ef.factor).toBe(450);
  });
});

describe("EmissionFactor - Boundary Factors", () => {
  test("factor 0 accepted", async () => {
    const ef = await EmissionFactor.create({ country: "NO", factor: 0 });
    expect(ef.factor).toBe(0);
  });
  test("high factor accepted", async () => {
    const ef = await EmissionFactor.create({ country: "XX", factor: 10000 });
    expect(ef.factor).toBe(10000);
  });
});

describe("EmissionFactor - Uniqueness", () => {
  test("rejects duplicate country", async () => {
    await EmissionFactor.create({ country: "CA", factor: 300 });
    await expect(
      EmissionFactor.create({ country: "CA", factor: 301 })
    ).rejects.toThrow();
  });
});

describe("EmissionFactor - Required Fields", () => {
  test("missing country fails", async () => {
    await expect(EmissionFactor.create({ factor: 200 })).rejects.toThrow();
  });
  test("missing factor fails", async () => {
    await expect(EmissionFactor.create({ country: "FR" })).rejects.toThrow();
  });
});
