import apiClient from "../../lib/apiClient";
import {
  GET_MY_HOME_ROUTE,
  UPDATE_HOME_ROUTE,
  HOME_STATS_ROUTE,
} from "../../utils/constants";

export const createHomeSlice = (set, get) => ({
  // State
  home: null,
  homeLoading: false,
  homeError: null,

  homeStats: null,
  statsLoading: false,
  statsError: null,

  // Setters
  setHome: (home) => set({ home, homeError: null }),
  clearHome: () =>
    set({
      home: null,
      homeLoading: false,
      homeError: null,
      homeStats: null,
      statsLoading: false,
      statsError: null,
    }),

  // Fetch the current user's home details
  fetchMyHome: async () => {
    set({ homeLoading: true, homeError: null });
    try {
      const res = await apiClient.get(GET_MY_HOME_ROUTE);
      // Expect either { home: {...} } or the home object directly
      const home = res.data?.home ?? res.data ?? null;
      set({ home, homeLoading: false });
      return home;
    } catch (err) {
      const status = err?.response?.status;
      // If user has no home yet (404/204), keep home as null
      if (status === 404 || status === 204) {
        set({ home: null, homeLoading: false, homeError: null });
        return null;
      }
      const message = err?.response?.data?.message || "Failed to fetch home";
      set({ home: null, homeLoading: false, homeError: message });
      return null;
    }
  },

  // Update home details (partial updates)
  updateHome: async (updates) => {
    set({ homeLoading: true, homeError: null });
    try {
      const res = await apiClient.patch(UPDATE_HOME_ROUTE, updates);
      const updated = res.data?.home ?? res.data ?? null;
      set({ home: updated, homeLoading: false });
      return updated;
    } catch (err) {
      const message = err?.response?.data?.message || "Failed to update home";
      set({ homeLoading: false, homeError: message });
      throw err;
    }
  },

  // Fetch aggregated home stats (emissions, breakdown, etc.)
  fetchHomeStats: async () => {
    const currentHome = get().home;
    // If no home exists yet, don't call the API
    if (!currentHome) {
      set({ homeStats: null, statsLoading: false, statsError: null });
      return null;
    }
    set({ statsLoading: true, statsError: null });
    try {
      const res = await apiClient.get(HOME_STATS_ROUTE);
      const stats = res.data?.stats ?? res.data ?? null;
      set({ homeStats: stats, statsLoading: false });
      return stats;
    } catch (err) {
      const status = err?.response?.status;
      if (status === 404 || status === 204) {
        set({ homeStats: null, statsLoading: false, statsError: null });
        return null;
      }
      const message =
        err?.response?.data?.message || "Failed to fetch home stats";
      set({ statsLoading: false, statsError: message });
      return null;
    }
  },
});
