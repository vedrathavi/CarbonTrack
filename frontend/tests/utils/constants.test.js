import { describe, it, expect } from "vitest";

describe("Constants", () => {
  it("HOST variable should be defined", async () => {
    const { HOST } = await import("@/utils/constants");
    expect(HOST).toBeDefined();
  });

  it("should have auth routes defined", async () => {
    const { AUTH_ROUTES, GET_USER_INFO, LOGOUT_ROUTE } = await import(
      "@/utils/constants"
    );

    expect(AUTH_ROUTES).toBeDefined();
    expect(typeof AUTH_ROUTES).toBe("string");
    expect(AUTH_ROUTES).toContain("/api");

    expect(GET_USER_INFO).toBeDefined();
    expect(LOGOUT_ROUTE).toBeDefined();
  });

  it("should have dashboard route helpers", async () => {
    const { getDashboardToday, getDashboardWeek, getDashboardMonth } =
      await import("@/utils/constants");

    expect(typeof getDashboardToday).toBe("function");
    expect(typeof getDashboardWeek).toBe("function");
    expect(typeof getDashboardMonth).toBe("function");

    expect(getDashboardToday("test-id")).toContain("test-id");
  });
});
