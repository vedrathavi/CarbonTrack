/**
 * Test Suite: Home Model
 * Coverage: Unit Tests, Boundary Tests, Partition Tests
 *
 * Test Categories:
 * 1. Valid Home Creation (Partition: Valid inputs)
 * 2. Home Code Generation Tests
 * 3. Member Management Tests
 * 4. Boundary Tests (Field limits, array sizes)
 * 5. Appliance Count Tests
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
import mongoose from "mongoose";

beforeAll(async () => {
  await setupTestDB();
});

afterAll(async () => {
  await teardownTestDB();
});

beforeEach(async () => {
  await clearTestDB();
});

describe("Home Model - Valid Creation Partition", () => {
  test("should create home with valid data", async () => {
    const user = await User.create({
      name: "Test User",
      email: "test@example.com",
    });

    const homeData = {
      address: {
        street: "123 Main St",
        city: "Test City",
        state: "TS",
        country: "US",
        postalCode: "12345",
      },
      totalRooms: 3,
      appliances: {
        ac: 2,
        heater: 1,
        refrigerator: 1,
      },
      emissionFactor: 450,
      createdBy: user._id,
      members: [{ userId: user._id, role: "admin" }],
    };

    const home = await Home.create(homeData);

    expect(home.address.city).toBe("Test City");
    expect(home.totalRooms).toBe(3);
    expect(home.appliances.airConditioner).toBe(0); // defaults to 0
    expect(home.homeCode).toBeDefined();
    expect(home.homeCode).toHaveLength(8);
  });

  test("should auto-generate unique 8-character home code", async () => {
    const user = await User.create({
      name: "Test User",
      email: "code@example.com",
    });

    const home1 = await Home.create({
      address: { country: "US", state: "CA", city: "Test City" },
      totalRooms: 2,
      createdBy: user._id,
      members: [{ userId: user._id, role: "admin" }],
    });

    const home2 = await Home.create({
      address: { country: "US", state: "CA", city: "Test City" },
      totalRooms: 3,
      createdBy: user._id,
      members: [{ userId: user._id, role: "member" }],
    });

    expect(home1.homeCode).toBeDefined();
    expect(home2.homeCode).toBeDefined();
    expect(home1.homeCode).not.toBe(home2.homeCode);
    expect(home1.homeCode).toMatch(/^[A-Za-z0-9_-]{8}$/);
  });
});

describe("Home Model - Boundary Tests", () => {
  let testUser;

  beforeEach(async () => {
    testUser = await User.create({
      name: "Boundary Test User",
      email: "boundary@example.com",
    });
  });

  test("should accept minimum rooms (1)", async () => {
    const home = await Home.create({
      address: { country: "US", state: "CA", city: "Test City" },
      totalRooms: 1,
      createdBy: testUser._id,
      members: [{ userId: testUser._id, role: "admin" }],
    });

    expect(home.totalRooms).toBe(1);
  });

  test("should accept maximum practical rooms (50)", async () => {
    const home = await Home.create({
      address: { country: "US", state: "CA", city: "Test City" },
      totalRooms: 50,
      createdBy: testUser._id,
      members: [{ userId: testUser._id, role: "admin" }],
    });

    expect(home.totalRooms).toBe(50);
  });

  test("should accept zero appliances", async () => {
    const home = await Home.create({
      address: { country: "US", state: "CA", city: "Test City" },
      totalRooms: 2,
      appliances: {
        ac: 0,
        heater: 0,
        refrigerator: 0,
      },
      createdBy: testUser._id,
      members: [{ userId: testUser._id, role: "admin" }],
    });

    expect(home.appliances.airConditioner).toBe(0);
  });

  test("should have default appliance counts", async () => {
    const home = await Home.create({
      address: { country: "US", state: "CA", city: "Test City" },
      totalRooms: 5,
      createdBy: testUser._id,
      members: [{ userId: testUser._id, role: "admin" }],
    });

    expect(home.appliances.airConditioner).toBe(0); // defaults to 0
    expect(home.appliances.refrigerator).toBe(0);
  });

  test("should handle single member", async () => {
    const home = await Home.create({
      address: { country: "US", state: "CA", city: "Test City" },
      totalRooms: 2,
      createdBy: testUser._id,
      members: [{ userId: testUser._id, role: "admin" }],
    });

    expect(home.members).toHaveLength(1);
  });

  test("should handle multiple members (10)", async () => {
    const users = [];
    for (let i = 0; i < 9; i++) {
      const user = await User.create({
        name: `User ${i}`,
        email: `user${i}@example.com`,
      });
      users.push(user);
    }

    const members = [
      { userId: testUser._id, role: "admin" },
      ...users.map((u) => ({ userId: u._id, role: "member" })),
    ];

    const home = await Home.create({
      address: { country: "US", state: "CA", city: "Test City" },
      totalRooms: 5,
      createdBy: testUser._id,
      members: members,
    });

    expect(home.members).toHaveLength(10);
  });
});

describe("Home Model - Emission Factor Tests", () => {
  let testUser;

  beforeEach(async () => {
    testUser = await User.create({
      name: "Emission Test User",
      email: "emission@example.com",
    });
  });

  test("should accept emission factor of 0 (clean energy)", async () => {
    const home = await Home.create({
      address: { country: "US", state: "CA", city: "Test City" },
      totalRooms: 2,
      emissionFactor: 0,
      createdBy: testUser._id,
      members: [{ userId: testUser._id, role: "admin" }],
    });

    expect(home.emissionFactor).toBe(0);
  });

  test("should accept typical emission factor (450)", async () => {
    const home = await Home.create({
      address: { country: "US", state: "CA", city: "Test City" },
      totalRooms: 2,
      emissionFactor: 450,
      createdBy: testUser._id,
      members: [{ userId: testUser._id, role: "admin" }],
    });

    expect(home.emissionFactor).toBe(450);
  });

  test("should accept high emission factor (1000)", async () => {
    const home = await Home.create({
      address: { country: "US", state: "CA", city: "Test City" },
      totalRooms: 2,
      emissionFactor: 1000,
      createdBy: testUser._id,
      members: [{ userId: testUser._id, role: "admin" }],
    });

    expect(home.emissionFactor).toBe(1000);
  });

  test("should handle null emission factor", async () => {
    const home = await Home.create({
      address: { country: "US", state: "CA", city: "Test City" },
      totalRooms: 2,
      emissionFactor: null,
      createdBy: testUser._id,
      members: [{ userId: testUser._id, role: "admin" }],
    });

    expect(home.emissionFactor).toBeNull();
  });
});

describe("Home Model - Member Role Tests", () => {
  let admin, member1, member2;

  beforeEach(async () => {
    admin = await User.create({ name: "Admin", email: "admin@test.com" });
    member1 = await User.create({ name: "Member1", email: "member1@test.com" });
    member2 = await User.create({ name: "Member2", email: "member2@test.com" });
  });

  test("should correctly identify admin using isAdmin method", async () => {
    const home = await Home.create({
      address: { country: "US", state: "CA", city: "Test City" },
      totalRooms: 2,
      createdBy: admin._id,
      members: [
        { userId: admin._id, role: "admin" },
        { userId: member1._id, role: "member" },
      ],
    });

    expect(home.isAdmin(admin._id)).toBe(true);
    expect(home.isAdmin(member1._id)).toBe(false);
  });

  test("should handle multiple admins", async () => {
    const home = await Home.create({
      address: { country: "US", state: "CA", city: "Test City" },
      totalRooms: 2,
      createdBy: admin._id,
      members: [
        { userId: admin._id, role: "admin" },
        { userId: member1._id, role: "admin" },
        { userId: member2._id, role: "member" },
      ],
    });

    expect(home.isAdmin(admin._id)).toBe(true);
    expect(home.isAdmin(member1._id)).toBe(true);
    expect(home.isAdmin(member2._id)).toBe(false);
  });
});

describe("Home Model - Intentional Failure Tests", () => {
  let testUser;

  beforeEach(async () => {
    testUser = await User.create({
      name: "Failure Test User",
      email: "failure@example.com",
    });
  });

  test("should reject negative room count", async () => {
    const homeData = {
      address: { country: "US", state: "CA", city: "Test City" },
      totalRooms: -1,
      createdBy: testUser._id,
      members: [{ userId: testUser._id, role: "admin" }],
    };

    await expect(Home.create(homeData)).rejects.toThrow();
  });

  test("should use default appliance values", async () => {
    const homeData = {
      address: { country: "US", state: "CA", city: "Test City" },
      totalRooms: 2,
      createdBy: testUser._id,
      members: [{ userId: testUser._id, role: "admin" }],
    };

    const home = await Home.create(homeData);
    expect(home.appliances.airConditioner).toBe(0);
  });

  test("should accept any emission factor value", async () => {
    const homeData = {
      address: { country: "US", state: "CA", city: "Test City" },
      totalRooms: 2,
      emissionFactor: 500,
      createdBy: testUser._id,
      members: [{ userId: testUser._id, role: "admin" }],
    };

    const home = await Home.create(homeData);
    expect(home.emissionFactor).toBe(500);
  });

  test("should reject home without createdBy", async () => {
    const homeData = {
      address: { country: "US", state: "CA", city: "Test City" },
      totalRooms: 2,
      members: [{ userId: testUser._id, role: "admin" }],
    };

    await expect(Home.create(homeData)).rejects.toThrow();
  });

  test("should reject invalid member role", async () => {
    const homeData = {
      address: { country: "US", state: "CA", city: "Test City" },
      totalRooms: 2,
      createdBy: testUser._id,
      members: [{ userId: testUser._id, role: "superadmin" }],
    };

    await expect(Home.create(homeData)).rejects.toThrow();
  });
});

describe("Home Model - Join By Code Tests", () => {
  let admin, newMember, home;

  beforeEach(async () => {
    admin = await User.create({ name: "Admin", email: "admin@join.com" });
    newMember = await User.create({ name: "NewMember", email: "new@join.com" });

    home = await Home.create({
      address: { country: "US", state: "CA", city: "Test City" },
      totalRooms: 2,
      createdBy: admin._id,
      members: [{ userId: admin._id, role: "admin" }],
    });
  });

  test("should successfully join home with valid code", async () => {
    const updatedHome = await Home.joinByHomeCode(home.homeCode, newMember._id);

    expect(updatedHome.members).toHaveLength(2);
    expect(
      updatedHome.members.some(
        (m) => m.userId.toString() === newMember._id.toString()
      )
    ).toBe(true);
  });

  test("should reject invalid home code", async () => {
    await expect(
      Home.joinByHomeCode("INVALID", newMember._id)
    ).rejects.toThrow();
  });

  test("should reject if user already member", async () => {
    await Home.joinByHomeCode(home.homeCode, newMember._id);

    await expect(
      Home.joinByHomeCode(home.homeCode, newMember._id)
    ).rejects.toThrow();
  });
});
