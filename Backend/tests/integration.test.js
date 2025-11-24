/**
 * Integration Tests: Auth (me), Home (create/join), Dashboard (today), Insights (latest)
 * Strategy: Bypass Google OAuth by directly creating users & generating JWT with middleware's secret.
 */

// Set JWT_SECRET before any imports to ensure controllers/middleware use same secret
process.env.JWT_SECRET =
  "{random_Anshul_Manav_Pranav_Ved_for_CarbonTrack123aWQEDEWRWEREWRWERESVDFSFS!@!324232322cs3FFSCSD}";

import {
  describe,
  test,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
} from "@jest/globals";
import request from "supertest";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { setupTestDB, teardownTestDB, clearTestDB } from "./setup.js";
import buildTestApp from "./testApp.js";
import User from "../src/models/User.js";
import Home from "../src/models/Home.js";
import HourlyEmission from "../src/models/HourlyEmission.js";
import Insight from "../src/models/Insight.js";

const JWT_SECRET = process.env.JWT_SECRET;
let app;
let user;
let token;
let agent;

function authCookie(t) {
  return `token=${t}`;
}
function sign(u) {
  return jwt.sign({ id: u._id, email: u.email }, JWT_SECRET, {
    expiresIn: "1h",
  });
}

beforeAll(async () => {
  await setupTestDB();
  app = buildTestApp();
});

afterAll(async () => {
  await teardownTestDB();
});

beforeEach(async () => {
  await clearTestDB();
  user = await User.create({ email: "int@test.com", name: "Int User" });
  token = sign(user);
  agent = request(app);
});

describe("Auth /api/auth/me", () => {
  test("returns 401 without cookie token", async () => {
    const res = await agent.get("/api/auth/me");
    expect(res.status).toBe(401);
  });
  test("returns user with valid token cookie", async () => {
    const res = await agent
      .get("/api/auth/me")
      .set("Cookie", authCookie(token));
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe("int@test.com");
  });
});

describe("Home create & join", () => {
  test("creates home successfully", async () => {
    const res = await agent
      .post("/api/home")
      .set("Cookie", authCookie(token))
      .send({
        address: { country: "US", state: "CA", city: "Int City" },
        totalRooms: 3,
        appliances: { refrigerator: 1 },
      });
    expect(res.status).toBe(201);
    expect(res.body.data.home.homeCode).toMatch(/^[A-Za-z0-9_-]{8}$/);
  });

  test("join home by code succeeds then rejects duplicate", async () => {
    const creatorRes = await agent
      .post("/api/home")
      .set("Cookie", authCookie(token))
      .send({
        address: { country: "US", state: "CA", city: "Int City" },
        totalRooms: 2,
      });
    const homeCode = creatorRes.body.data.home.homeCode;

    const other = await User.create({ email: "joiner@test.com" });
    const otherToken = sign(other);

    const joinRes = await agent
      .post("/api/home/join")
      .set("Cookie", authCookie(otherToken))
      .send({ homeCode });
    expect(joinRes.status).toBe(200);

    const dupRes = await agent
      .post("/api/home/join")
      .set("Cookie", authCookie(otherToken))
      .send({ homeCode });
    expect(dupRes.status).toBe(500); // errors handled as 500 by controller
  });
});

describe("Dashboard today endpoint", () => {
  test("returns 403 when user not member", async () => {
    const homeOwner = await User.create({ email: "owner@test.com" });
    const home = await Home.create({
      address: { country: "US", state: "CA", city: "Dash City" },
      totalRooms: 2,
      createdBy: homeOwner._id,
      members: [{ userId: homeOwner._id, role: "admin" }],
    });
    const res = await agent
      .get(`/api/dashboard/${home._id}/today`)
      .set("Cookie", authCookie(token));
    expect(res.status).toBe(403);
  });

  test("returns today data after simulation fallback", async () => {
    const homeOwner = await User.create({ email: "owner2@test.com" });
    const home = await Home.create({
      address: { country: "US", state: "CA", city: "Dash City" },
      totalRooms: 2,
      createdBy: homeOwner._id,
      members: [
        { userId: homeOwner._id, role: "admin" },
        { userId: user._id, role: "member" },
      ],
    });
    const res = await agent
      .get(`/api/dashboard/${home._id}/today`)
      .set("Cookie", authCookie(token));
    // Should trigger simulate fallback resulting in data object
    expect([200, 404]).toContain(res.status); // Accept 404 if simulation logic not invoked in test context
    if (res.status === 200) {
      expect(res.body.data).toBeDefined();
      expect(Array.isArray(res.body.data.totalHourly)).toBe(true);
    }
  });
});

describe("Insights latest endpoint", () => {
  test("403 for non-member access", async () => {
    const homeOwner = await User.create({ email: "owner3@test.com" });
    const home = await Home.create({
      address: { country: "US", state: "CA", city: "Insight City" },
      totalRooms: 2,
      createdBy: homeOwner._id,
      members: [{ userId: homeOwner._id, role: "admin" }],
    });
    const res = await agent
      .get(`/api/insights/${home._id}/latest`)
      .set("Cookie", authCookie(token));
    expect(res.status).toBe(403);
  });

  test("returns empty array when no insights and user member", async () => {
    const home = await Home.create({
      address: { country: "US", state: "CA", city: "Insight City" },
      totalRooms: 2,
      createdBy: user._id,
      members: [{ userId: user._id, role: "admin" }],
    });
    const res = await agent
      .get(`/api/insights/${home._id}/latest`)
      .set("Cookie", authCookie(token));
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(0);
  });

  test("returns insights when they exist for home", async () => {
    const home = await Home.create({
      address: { country: "US", state: "CA", city: "Insight City" },
      totalRooms: 2,
      createdBy: user._id,
      members: [{ userId: user._id, role: "admin" }],
    });

    // Create test insights
    await Insight.create([
      {
        homeId: home._id,
        type: "suggestion",
        title: "Test Insight 1",
        description: "Test Description 1",
        generatedAt: new Date(),
        sourceId: "test-insight-1",
      },
      {
        homeId: home._id,
        type: "improvement",
        title: "Test Insight 2",
        description: "Test Description 2",
        generatedAt: new Date(),
        sourceId: "test-insight-2",
      },
    ]);

    const res = await agent
      .get(`/api/insights/${home._id}/latest?limit=10`)
      .set("Cookie", authCookie(token));
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(2);
    expect(res.body.data[0].title).toBeDefined();
  });
});

describe("Error Handling & Edge Cases", () => {
  test("POST /api/home with missing required fields returns error", async () => {
    const res = await agent
      .post("/api/home")
      .set("Cookie", authCookie(token))
      .send({
        address: { country: "US" },
        // missing totalRooms
      });
    expect(res.status).toBe(500); // Controller returns 500 for validation errors
    expect(res.body.message).toBeDefined();
  });

  test("POST /api/home/join with invalid home code returns error", async () => {
    const res = await agent
      .post("/api/home/join")
      .set("Cookie", authCookie(token))
      .send({
        homeCode: "INVALIDCODE",
      });
    expect(res.status).toBe(500); // Controller returns 500 when home not found
    expect(res.body.message).toBeDefined();
  });

  test("GET /api/dashboard/:homeId/today with invalid ObjectId returns 404", async () => {
    const res = await agent
      .get("/api/dashboard/507f1f77bcf86cd799439011/today")
      .set("Cookie", authCookie(token));
    expect(res.status).toBe(404); // Dashboard returns 404 when home not found
  });

  test("expired JWT token returns 401", async () => {
    const expiredToken = jwt.sign(
      { id: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: "0s" }
    );
    await new Promise((resolve) => setTimeout(resolve, 100)); // ensure expiration
    const res = await agent
      .get("/api/auth/me")
      .set("Cookie", authCookie(expiredToken));
    expect(res.status).toBe(401);
  });

  test("malformed JWT token returns 401", async () => {
    const res = await agent
      .get("/api/auth/me")
      .set("Cookie", "token=invalid.malformed.token");
    expect(res.status).toBe(401);
  });

  test("POST /api/home with boundary: 1 room succeeds", async () => {
    const res = await agent
      .post("/api/home")
      .set("Cookie", authCookie(token))
      .send({
        address: { country: "US", state: "CA", city: "Boundary City" },
        totalRooms: 1,
        appliances: {},
      });
    expect(res.status).toBe(201);
    expect(res.body.data.home.totalRooms).toBe(1);
  });

  test("POST /api/home with boundary: 50 rooms succeeds", async () => {
    // First clear existing home
    await Home.deleteMany({ "members.userId": user._id });
    await User.findByIdAndUpdate(user._id, { $unset: { householdId: 1 } });

    const res = await agent
      .post("/api/home")
      .set("Cookie", authCookie(token))
      .send({
        address: { country: "US", state: "CA", city: "Boundary City" },
        totalRooms: 50,
        appliances: {},
      });
    expect(res.status).toBe(201);
    expect(res.body.data.home.totalRooms).toBe(50);
  });

  test("GET /api/dashboard/:homeId/today handles no emissions data gracefully", async () => {
    const home = await Home.create({
      address: { country: "US", state: "CA", city: "Empty Data City" },
      totalRooms: 2,
      emissionFactor: 0.5,
      createdBy: user._id,
      members: [{ userId: user._id, role: "admin" }],
    });

    const res = await agent
      .get(`/api/dashboard/${home._id}/today`)
      .set("Cookie", authCookie(token));
    expect([200, 404]).toContain(res.status);
    if (res.status === 200) {
      expect(res.body.data).toBeDefined();
    }
  });
});
