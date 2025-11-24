import apiClient from "../../lib/apiClient";
import {
  GET_MY_HOME_ROUTE,
  UPDATE_HOME_ROUTE,
  HOME_STATS_ROUTE,
  HOME_MEMBERS_ROUTE,
} from "../../utils/constants";

export const createHomeSlice = (set, get) => ({
  home: null,
  homeLoading: false,
  homeError: null,

  homeStats: null,
  statsLoading: false,
  statsError: null,

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

  fetchMyHome: async () => {
    set({ homeLoading: true, homeError: null });
    try {
      const res = await apiClient.get(GET_MY_HOME_ROUTE);
      const home = res.data?.home ?? res.data ?? null;
      console.log("Home data loaded successfully");
      set({ home, homeLoading: false });
      return home;
    } catch (err) {
      const status = err?.response?.status;
      if (status === 404 || status === 204) {
        set({ home: null, homeLoading: false, homeError: null });
        return null;
      }
      const message = err?.response?.data?.message || "Failed to fetch home";
      console.error("Could not load home:", message);
      set({ home: null, homeLoading: false, homeError: message });
      return null;
    }
  },

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

  fetchHomeStats: async () => {
    const currentHome = get().home;
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

  fetchHomeMembers: async () => {
    set({ homeLoading: true, homeError: null });
    try {
      const res = await apiClient.get(HOME_MEMBERS_ROUTE);
      const members =
        res?.data?.data?.members ?? res?.data?.members ?? res?.data ?? [];
      set({ homeLoading: false });
      return Array.isArray(members) ? members : [];
    } catch (err) {
      const message = err?.response?.data?.message || "Failed to fetch members";
      set({ homeLoading: false, homeError: message });
      return [];
    }
  },
});

export default createHomeSlice;
