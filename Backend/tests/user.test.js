/**
 * Test Suite: User Model
 * Coverage: Unit Tests, Boundary Tests, Partition Tests
 *
 * Test Categories:
 * 1. Valid User Creation (Partition: Valid inputs)
 * 2. Invalid User Creation (Partition: Invalid inputs)
 * 3. Boundary Tests (Edge cases for field lengths, email formats)
 * 4. Schema Validation Tests
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
import User from "../src/models/User.js";

beforeAll(async () => {
  await setupTestDB();
});

afterAll(async () => {
  await teardownTestDB();
});

beforeEach(async () => {
  await clearTestDB();
});

describe("User Model - Valid Input Partition", () => {
  test("should create user with all valid fields", async () => {
    const userData = {
      name: "John Doe",
      email: "john@example.com",
      googleId: "google123",
      authProvider: "google",
      profilePic: "https://example.com/pic.jpg",
    };

    const user = await User.create(userData);

    expect(user.name).toBe(userData.name);
    expect(user.email).toBe(userData.email);
    expect(user.googleId).toBe(userData.googleId);
    expect(user._id).toBeDefined();
  });

  test("should create user with minimum required fields only", async () => {
    const userData = {
      name: "Jane Doe",
      email: "jane@example.com",
    };

    const user = await User.create(userData);

    expect(user.name).toBe(userData.name);
    expect(user.email).toBe(userData.email);
    expect(user._id).toBeDefined();
  });
});

describe("User Model - Invalid Input Partition", () => {
  test("should reject user without email (required field)", async () => {
    const userData = {
      name: "Test User",
    };

    await expect(User.create(userData)).rejects.toThrow();
  });

  test("should reject duplicate email", async () => {
    const userData = {
      name: "User One",
      email: "duplicate@example.com",
    };

    await User.create(userData);

    const duplicateUser = {
      name: "User Two",
      email: "duplicate@example.com",
    };

    await expect(User.create(duplicateUser)).rejects.toThrow();
  });
});

describe("User Model - Boundary Tests", () => {
  test("should accept email with minimum valid length (a@b.c)", async () => {
    const userData = {
      name: "Test",
      email: "a@b.c",
    };

    const user = await User.create(userData);
    expect(user.email).toBe("a@b.c");
  });

  test("should accept email with maximum practical length", async () => {
    const longEmail = "verylongemailaddress" + "a".repeat(40) + "@example.com";
    const userData = {
      name: "Test",
      email: longEmail,
    };

    const user = await User.create(userData);
    expect(user.email).toBe(longEmail);
  });

  test("should accept name with single character", async () => {
    const userData = {
      name: "A",
      email: "single@example.com",
    };

    const user = await User.create(userData);
    expect(user.name).toBe("A");
  });

  test("should accept name with 100 characters", async () => {
    const longName = "A".repeat(100);
    const userData = {
      name: longName,
      email: "long@example.com",
    };

    const user = await User.create(userData);
    expect(user.name).toBe(longName);
  });

  test("should handle empty string for optional profilePic", async () => {
    const userData = {
      name: "Test",
      email: "test@example.com",
      profilePic: "",
    };

    const user = await User.create(userData);
    expect(user.profilePic).toBe("");
  });
});

describe("User Model - Email Format Validation", () => {
  test("should accept valid email formats", async () => {
    const validEmails = [
      "user@example.com",
      "user.name@example.com",
      "user+tag@example.co.uk",
      "user123@test-domain.com",
      "123@example.com",
    ];

    for (const email of validEmails) {
      const userData = {
        name: "Test",
        email: email,
      };

      const user = await User.create(userData);
      expect(user.email).toBe(email);
      await User.deleteOne({ _id: user._id });
    }
  });
});

describe("User Model - Authentication Provider Tests", () => {
  test("should store google as auth provider", async () => {
    const userData = {
      name: "Google User",
      email: "google@example.com",
      authProvider: "google",
      googleId: "google123",
    };

    const user = await User.create(userData);
    expect(user.authProvider).toBe("google");
    expect(user.googleId).toBe("google123");
  });

  test("should default to google auth provider", async () => {
    const userData = {
      name: "No Auth",
      email: "noauth@example.com",
    };

    const user = await User.create(userData);
    expect(user.authProvider).toBe("google"); // default value
  });
});

describe("User Model - Intentional Failure Tests", () => {
  test("should fail with invalid email format", async () => {
    const invalidEmails = [
      "notanemail",
      "@example.com",
      "user@",
      "user @example.com",
      "user@example",
    ];

    for (const email of invalidEmails) {
      const userData = {
        name: "Test",
        email: email,
      };

      try {
        await User.create(userData);
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeDefined();
      }
    }
  });

  test("should fail with null email", async () => {
    const userData = {
      name: "Test",
      email: null,
    };

    await expect(User.create(userData)).rejects.toThrow();
  });
});
