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
      // Try to instruct Google Identity to stop auto-selecting the previous account
      if (typeof window !== "undefined") {
        try {
          if (window.google?.accounts?.id?.disableAutoSelect) {
            window.google.accounts.id.disableAutoSelect();
          }
          // Some integrations expose a revoke function
          if (window.google?.accounts?.id?.revoke) {
            window.google.accounts.id.revoke();
          }
        } catch (e) {
          console.debug("google disableAutoSelect/revoke failed:", e);
        }

        // Legacy gapi.auth2 signOut
        try {
          if (window.gapi?.auth2) {
            const auth2 = window.gapi.auth2.getAuthInstance();
            if (auth2 && auth2.signOut) await auth2.signOut();
          }
        } catch (e) {
          console.debug("gapi signOut failed:", e);
        }
      }

      const res = await apiClient.get(LOGOUT_ROUTE);
      if (res.status === 200) {
        console.log("Logout successful");
        set({ userInfo: null, error: null });
        // Clear any home-related state as well
        try {
          const clearHome = get().clearHome;
          if (typeof clearHome === "function") clearHome();
        } catch {
          void 0; // no-op
        }
      } else {
        console.warn("Logout failed with status:", res.status);
      }
    } catch (err) {
      console.warn("Logout failed:", err);
      set({ userInfo: null, error: null });
      try {
        const clearHome = get().clearHome;
        if (typeof clearHome === "function") clearHome();
      } catch {
        void 0; // no-op
      }
    }
  },

  // 🔹 Helpers
  isAuthenticated: () => !!get().userInfo,
});
