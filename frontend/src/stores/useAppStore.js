import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createAuthSlice } from "./slice/authSlice";

export const useAppStore = create(
  persist(
    (...a) => ({
      ...createAuthSlice(...a),
    }),
    { name: "app-storage" }
  )
);

export const useAuth = (selector) => useAppStore(selector);

export default useAppStore;
