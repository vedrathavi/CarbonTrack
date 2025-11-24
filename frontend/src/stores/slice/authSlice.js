import apiClient from "../../lib/apiClient";
import { GET_USER_INFO, LOGOUT_ROUTE } from "../../utils/constants";

export const createAuthSlice = (set, get) => ({
  userInfo: null,
  loading: false,
  error: null,

  setUser: (user) => set({ userInfo: user, loading: false, error: null }),
  clearUser: () => set({ userInfo: null, error: null }),

  fetchUser: async () => {
    set({ loading: true, error: null });
    try {
      const res = await apiClient.get(GET_USER_INFO);
      set({ userInfo: res.data?.user || res.data, loading: false });
    } catch (err) {
      console.error(
        "Failed to fetch user info:",
        err?.response?.data?.message || err.message
      );
      set({
        userInfo: null,
        loading: false,
        error: err?.response?.data?.message || "Failed to fetch user",
      });
    }
  },

  logout: async () => {
    try {
      if (typeof window !== "undefined") {
        try {
          if (window.google?.accounts?.id?.disableAutoSelect) {
            window.google.accounts.id.disableAutoSelect();
          }
          if (window.google?.accounts?.id?.revoke) {
            window.google.accounts.id.revoke();
          }
        } catch (e) {
          console.debug("Google sign-out cleanup skipped");
        }

        try {
          if (window.gapi?.auth2) {
            const auth2 = window.gapi.auth2.getAuthInstance();
            if (auth2 && auth2.signOut) await auth2.signOut();
          }
        } catch (e) {
          console.debug("Legacy Google sign-out skipped");
        }
      }

      const res = await apiClient.get(LOGOUT_ROUTE);
      if (res.status === 200) {
        console.log("Successfully logged out");
        set({ userInfo: null, error: null });
        try {
          const clearHome = get().clearHome;
          if (typeof clearHome === "function") clearHome();
        } catch {
          void 0;
        }
      } else {
        console.error("Logout failed with status:", res.status);
      }
    } catch (err) {
      console.error("Logout error:", err.message);
      set({ userInfo: null, error: null });
      try {
        const clearHome = get().clearHome;
        if (typeof clearHome === "function") clearHome();
      } catch {
        void 0;
      }
    }
  },

  isAuthenticated: () => !!get().userInfo,
});
