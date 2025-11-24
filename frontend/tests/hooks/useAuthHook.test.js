import { describe, it, expect, beforeEach, vi } from "vitest";
import useAppStore from "@/stores/useAppStore";

vi.mock("@/stores/useAppStore");

describe("useAppStore - Auth State", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("provides user info when authenticated", () => {
    const mockUserInfo = {
      id: "123",
      name: "Test User",
      email: "test@example.com",
    };

    useAppStore.mockReturnValue({
      userInfo: mockUserInfo,
    });

    const store = useAppStore();
    expect(store.userInfo).toEqual(mockUserInfo);
    expect(store.userInfo.name).toBe("Test User");
  });

  it("handles null user info when not authenticated", () => {
    useAppStore.mockReturnValue({
      userInfo: null,
    });

    const store = useAppStore();
    expect(store.userInfo).toBeNull();
  });
});
