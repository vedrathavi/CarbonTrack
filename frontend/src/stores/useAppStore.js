import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createAuthSlice } from "./slice/authSlice";
import { createHomeSlice } from "./slice/homeSlice";
import { createInsightSlice } from "./slice/insightSlice";

export const useAppStore = create(
  persist(
    (...a) => ({
      ...createAuthSlice(...a),
      ...createHomeSlice(...a),
      ...createInsightSlice(...a),
    }),
    {
      name: "app-storage",
      // persist only userInfo and home (avoid persisting transient loading/error flags)
      partialize: (state) => ({ userInfo: state.userInfo, home: state.home }),
    }
  )
);

export const useAuth = (selector) => useAppStore(selector);

export default useAppStore;
