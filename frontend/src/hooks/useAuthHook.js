import { useEffect } from "react";
import { useAppStore } from "../stores/useAppStore";

export const useFetchUser = () => {
  const { userInfo, loading, fetchUser } = useAppStore();

  useEffect(() => {
    if (!userInfo && !loading) {
      fetchUser().catch(() => {}); // fetch after OAuth redirect
    }
  }, []); // run once on mount

  return { userInfo, loading };
};
