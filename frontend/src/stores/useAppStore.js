import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createAuthSlice } from "./slice/authSlice";
import { createHomeSlice } from "./slice/homeSlice";

export const useAppStore = create(
  persist(
    (...a) => ({
      ...createAuthSlice(...a),
      ...createHomeSlice(...a),
    }),
    {
      name: "app-storage",
      // only persist userInfo (do not persist loading/error transient flags)
      partialize: (state) => ({ userInfo: state.userInfo }),
    }
  )
);

export const useAuth = (selector) => useAppStore(selector);

export default useAppStore;
