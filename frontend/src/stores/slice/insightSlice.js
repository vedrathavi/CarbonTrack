import apiClient from "../../lib/apiClient";
import { getInsightsLatest, postGenerateInsights } from "../../utils/constants";
import { toast } from "sonner";

export const createInsightSlice = (set, get) => ({
  insights: [],
  insightsLoading: false,
  insightsError: null,

  setInsights: (ins) => set({ insights: ins, insightsError: null }),

  fetchInsightsForHome: async (homeId, limit = 10) => {
    if (!homeId) return null;
    set({ insightsLoading: true, insightsError: null });
    try {
      const url = getInsightsLatest(homeId, limit);
      const res = await apiClient.get(url);
      const data = res?.data?.data ?? res?.data ?? [];
      console.log(`Loaded ${Array.isArray(data) ? data.length : 0} insights`);
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
      console.error("Could not load insights:", message);
      toast.error("Could not load insights");
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
      console.log(`Generated ${saved.length} new insights`);
      toast.success(`Generated ${saved.length} fresh insights!`);
      await get().fetchInsightsForHome(homeId);
      set({ insightsLoading: false, insightsError: null });
      return saved;
    } catch (err) {
      const message =
        err?.response?.data?.error ||
        err?.message ||
        "Failed to generate insights";
      console.error("Could not generate insights:", message);
      toast.error("Could not generate new insights");
      set({ insightsLoading: false, insightsError: message });
      return [];
    }
  },
});

export default createInsightSlice;
