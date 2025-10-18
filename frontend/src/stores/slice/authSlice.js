import apiClient from "../../lib/apiClient";
import { GET_USER_INFO, LOGOUT_ROUTE } from "../../utils/constants";

export const createAuthSlice = (set, get) => ({
  userInfo: null,
  loading: false,
  error: null,

  // 🔹 Setters
  setUser: (user) => set({ userInfo: user, loading: false, error: null }),
  clearUser: () => set({ userInfo: null, error: null }),

  // 🔹 Fetch user info
  fetchUser: async () => {
    set({ loading: true, error: null });
    try {
      const res = await apiClient.get(GET_USER_INFO);
      console.log("Fetched user:", res.data);
      set({ userInfo: res.data?.user || res.data, loading: false });
    } catch (err) {
      console.error("Error fetching user:", err?.response?.data || err);
      set({
        userInfo: null,
        loading: false,
        error: err?.response?.data?.message || "Failed to fetch user",
      });
    }
  },

  // 🔹 Logout
  logout: async () => {
    try {
      await apiClient.get(LOGOUT_ROUTE);
    } catch (err) {
      console.warn("Logout failed:", err);
    }
    set({ userInfo: null, error: null });
  },

  // 🔹 Helpers
  isAuthenticated: () => !!get().userInfo,
});
