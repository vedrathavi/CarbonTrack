/**
 * Test Suite: JWT Token Verification Middleware
 * Coverage: Unit Tests, Boundary Tests, Security Tests
 *
 * Test Categories:
 * 1. Valid Token Tests
 * 2. Invalid Token Tests (Partition: Various invalid formats)
 * 3. Boundary Tests (Token expiration, malformed tokens)
 * 4. Security Tests (Token tampering, algorithm manipulation)
 */

import {
  describe,
  test,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
  jest,
} from "@jest/globals";
import jwt from "jsonwebtoken";
import httpMocks from "node-mocks-http";
import verifyToken from "../src/middleware/verifyToken.js";
import { setupTestDB, teardownTestDB, clearTestDB } from "./setup.js";
import User from "../src/models/User.js";

// Use the same default secret as middleware ('change_me') to produce valid tokens
const JWT_SECRET = "change_me";

beforeAll(async () => {
  await setupTestDB();
});

afterAll(async () => {
  await teardownTestDB();
});

beforeEach(async () => {
  await clearTestDB();
});

describe("JWT Middleware - Valid Token Tests", () => {
  test("should accept valid token and set user + userId", async () => {
    const user = await User.create({
      name: "Test User",
      email: "test@example.com",
    });
    const userId = user._id.toString();
    const token = jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: "7d" });

    const req = httpMocks.createRequest({
      cookies: { token },
    });
    const res = httpMocks.createResponse();
    const next = jest.fn();

    await verifyToken(req, res, next);

    expect(req.user).toBeDefined();
    expect(req.userId).toBe(userId);
    expect(req.user._id.toString()).toBe(userId);
    expect(next).toHaveBeenCalled();
  });

  test("should accept token from Authorization header", async () => {
    const user = await User.create({
      name: "Header User",
      email: "header@example.com",
    });
    const userId = user._id.toString();
    const token = jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: "7d" });

    const req = httpMocks.createRequest({
      headers: {
        authorization: `Bearer ${token}`,
      },
    });
    const res = httpMocks.createResponse();
    const next = jest.fn();

    await verifyToken(req, res, next);

    expect(req.user).toBeDefined();
    expect(req.userId).toBe(userId);
    expect(req.user._id.toString()).toBe(userId);
    expect(next).toHaveBeenCalled();
  });
});

describe("JWT Middleware - Invalid Token Partition", () => {
  test("should reject request without token", async () => {
    const req = httpMocks.createRequest({});
    const res = httpMocks.createResponse();
    const next = jest.fn();

    await verifyToken(req, res, next);

    expect(res.statusCode).toBe(401);
    expect(next).not.toHaveBeenCalled();
  });

  test("should reject malformed token", async () => {
    const req = httpMocks.createRequest({
      cookies: { token: "malformed.token.string" },
    });
    const res = httpMocks.createResponse();
    const next = jest.fn();

    await verifyToken(req, res, next);

    expect(res.statusCode).toBe(401);
    expect(next).not.toHaveBeenCalled();
  });

  test("should reject token with wrong secret", async () => {
    const token = jwt.sign({ id: "123" }, "wrong-secret", { expiresIn: "7d" });

    const req = httpMocks.createRequest({
      cookies: { token },
    });
    const res = httpMocks.createResponse();
    const next = jest.fn();

    await verifyToken(req, res, next);

    expect(res.statusCode).toBe(401);
    expect(next).not.toHaveBeenCalled();
  });

  test("should reject expired token", async () => {
    const token = jwt.sign({ id: "123" }, JWT_SECRET, { expiresIn: "-1s" });

    const req = httpMocks.createRequest({
      cookies: { token },
    });
    const res = httpMocks.createResponse();
    const next = jest.fn();

    await verifyToken(req, res, next);

    expect(res.statusCode).toBe(401);
    expect(next).not.toHaveBeenCalled();
  });
});

describe("JWT Middleware - Boundary Tests", () => {
  test("should accept token expiring in 1 second", async () => {
    const user = await User.create({
      email: "boundary1@example.com",
    });
    const userId = user._id.toString();
    const token = jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: "1s" });

    const req = httpMocks.createRequest({
      cookies: { token },
    });
    const res = httpMocks.createResponse();
    const next = jest.fn();

    await verifyToken(req, res, next);

    expect(req.user).toBeDefined();
    expect(req.userId).toBe(userId);
    expect(req.user._id.toString()).toBe(userId);
    expect(next).toHaveBeenCalled();
  });

  test("should reject token with non-existent user", async () => {
    const fakeUserId = "507f1f77bcf86cd799439011";
    const token = jwt.sign({ id: fakeUserId }, JWT_SECRET);

    const req = httpMocks.createRequest({
      cookies: { token },
    });
    const res = httpMocks.createResponse();
    const next = jest.fn();

    await verifyToken(req, res, next);

    expect(res.statusCode).toBe(401);
    expect(next).not.toHaveBeenCalled();
  });

  test("should accept token with large payload", async () => {
    const user = await User.create({
      email: "boundary3@example.com",
    });
    const userId = user._id.toString();
    const largeData = "x".repeat(1000);
    const token = jwt.sign({ id: userId, data: largeData }, JWT_SECRET);

    const req = httpMocks.createRequest({
      cookies: { token },
    });
    const res = httpMocks.createResponse();
    const next = jest.fn();

    await verifyToken(req, res, next);

    expect(req.user).toBeDefined();
    expect(req.userId).toBe(userId);
    expect(req.user._id.toString()).toBe(userId);
    expect(next).toHaveBeenCalled();
  });
});

describe("JWT Middleware - Security Tests", () => {
  test("should reject token with tampered payload", async () => {
    const token = jwt.sign({ id: "123" }, JWT_SECRET);
    const parts = token.split(".");
    const tamperedPayload = Buffer.from(JSON.stringify({ id: "456" })).toString(
      "base64"
    );
    const tamperedToken = `${parts[0]}.${tamperedPayload}.${parts[2]}`;

    const req = httpMocks.createRequest({
      cookies: { token: tamperedToken },
    });
    const res = httpMocks.createResponse();
    const next = jest.fn();

    await verifyToken(req, res, next);

    expect(res.statusCode).toBe(401);
    expect(next).not.toHaveBeenCalled();
  });

  test("should reject empty token string", async () => {
    const req = httpMocks.createRequest({
      cookies: { token: "" },
    });
    const res = httpMocks.createResponse();
    const next = jest.fn();

    await verifyToken(req, res, next);

    expect(res.statusCode).toBe(401);
    expect(next).not.toHaveBeenCalled();
  });

  test("should reject token with null value", async () => {
    const req = httpMocks.createRequest({
      cookies: { token: null },
    });
    const res = httpMocks.createResponse();
    const next = jest.fn();

    await verifyToken(req, res, next);

    expect(res.statusCode).toBe(401);
    expect(next).not.toHaveBeenCalled();
  });

  test("should reject token with undefined value", async () => {
    const req = httpMocks.createRequest({
      cookies: { token: undefined },
    });
    const res = httpMocks.createResponse();
    const next = jest.fn();

    await verifyToken(req, res, next);

    expect(res.statusCode).toBe(401);
    expect(next).not.toHaveBeenCalled();
  });
});

describe("JWT Middleware - Token Format Tests", () => {
  test("should reject token without Bearer prefix when in header", async () => {
    const token = jwt.sign({ id: "123" }, JWT_SECRET);

    const req = httpMocks.createRequest({
      headers: {
        authorization: token,
      },
    });
    const res = httpMocks.createResponse();
    const next = jest.fn();

    await verifyToken(req, res, next);

    expect(res.statusCode).toBe(401);
  });

  test("should reject malformed Authorization header", async () => {
    const req = httpMocks.createRequest({
      headers: {
        authorization: "InvalidFormat token",
      },
    });
    const res = httpMocks.createResponse();
    const next = jest.fn();

    await verifyToken(req, res, next);

    expect(res.statusCode).toBe(401);
  });

  test("should handle multiple spaces in Authorization header", async () => {
    const token = jwt.sign({ id: "123" }, JWT_SECRET);

    const req = httpMocks.createRequest({
      headers: {
        authorization: `Bearer  ${token}`,
      },
    });
    const res = httpMocks.createResponse();
    const next = jest.fn();

    await verifyToken(req, res, next);

    expect(res.statusCode).toBe(401);
  });
});
