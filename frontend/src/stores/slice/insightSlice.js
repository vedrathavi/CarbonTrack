import apiClient from "../../lib/apiClient";
import { getInsightsLatest, postGenerateInsights } from "../../utils/constants";

export const createInsightSlice = (set, get) => ({
  insights: [],
  insightsLoading: false,
  insightsError: null,

  setInsights: (ins) => set({ insights: ins, insightsError: null }),

  fetchInsightsForHome: async (homeId, limit = 10) => {
    if (!homeId) return null;
    set({ insightsLoading: true, insightsError: null });
    console.info(
      "[insightSlice] fetchInsightsForHome homeId=",
      homeId,
      "limit=",
      limit
    );
    try {
      const url = getInsightsLatest(homeId, limit);
      console.info("[insightSlice] GET", url);
      const res = await apiClient.get(url);
      const data = res?.data?.data ?? res?.data ?? [];
      console.info(
        "[insightSlice] fetched insights count=",
        Array.isArray(data) ? data.length : 0
      );
      set({
        insights: Array.isArray(data) ? data : [],
        insightsLoading: false,
      });
      return data;
    } catch (err) {
      const message =
        err?.response?.data?.error ||
        err?.message ||
        "Failed to fetch insights";
      console.warn("[insightSlice] fetch failed", { err, message });
      set({ insights: [], insightsLoading: false, insightsError: message });
      return null;
    }
  },

  generateInsightsForHome: async (homeId, payload = {}) => {
    if (!homeId) throw new Error("homeId required");
    set({ insightsLoading: true, insightsError: null });
    try {
      const res = await apiClient.post(postGenerateInsights(homeId), payload);
      const saved = res?.data?.saved ?? res?.data ?? [];
      // refresh local cache
      await get().fetchInsightsForHome(homeId);
      set({ insightsLoading: false });
      return saved;
    } catch (err) {
      const message =
        err?.response?.data?.error ||
        err?.message ||
        "Failed to generate insights";
      set({ insightsLoading: false, insightsError: message });
      throw err;
    }
  },
});

export default createInsightSlice;
