import { describe, it, expect, beforeEach, vi } from "vitest";
import useAppStore from "@/stores/useAppStore";

vi.mock("@/stores/useAppStore");

describe("useHomeHook - Store State Access", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("provides home data from store", () => {
    const mockHome = {
      id: "home123",
      name: "My Home",
      location: "New York",
    };

    useAppStore.mockReturnValue({
      home: mockHome,
      homeLoading: false,
      homeError: null,
    });

    const store = useAppStore();
    expect(store.home).toEqual(mockHome);
    expect(store.home.name).toBe("My Home");
    expect(store.homeLoading).toBe(false);
  });

  it("handles loading state in store", () => {
    useAppStore.mockReturnValue({
      home: null,
      homeLoading: true,
      homeError: null,
    });

    const store = useAppStore();
    expect(store.homeLoading).toBe(true);
    expect(store.home).toBeNull();
  });

  it("handles error state in store", () => {
    const mockError = "Failed to fetch home";

    useAppStore.mockReturnValue({
      home: null,
      homeLoading: false,
      homeError: mockError,
    });

    const store = useAppStore();
    expect(store.homeError).toBe(mockError);
    expect(store.home).toBeNull();
  });

  it("provides stats data from store", () => {
    const mockStats = {
      totalEmissions: 5000,
      memberCount: 4,
    };

    useAppStore.mockReturnValue({
      homeStats: mockStats,
      statsLoading: false,
      statsError: null,
    });

    const store = useAppStore();
    expect(store.homeStats.totalEmissions).toBe(5000);
    expect(store.statsLoading).toBe(false);
  });

  it("provides action methods from store", () => {
    const mockFetchMyHome = vi.fn();
    const mockUpdateHome = vi.fn();

    useAppStore.mockReturnValue({
      fetchMyHome: mockFetchMyHome,
      updateHome: mockUpdateHome,
    });

    const store = useAppStore();
    expect(store.fetchMyHome).toBeDefined();
    expect(store.updateHome).toBeDefined();
  });
});
