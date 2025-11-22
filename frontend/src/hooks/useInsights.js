import { useEffect } from "react";
import useAppStore from "../stores/useAppStore";

export default function useInsights() {
  const home = useAppStore((s) => s.home);
  const homeLoading = useAppStore((s) => s.homeLoading);
  const fetchMyHome = useAppStore((s) => s.fetchMyHome);

  const insights = useAppStore((s) => s.insights);
  const insightsLoading = useAppStore((s) => s.insightsLoading);
  const insightsError = useAppStore((s) => s.insightsError);
  const fetchInsightsForHome = useAppStore((s) => s.fetchInsightsForHome);
  const resolvedHome =
    home?.data?.home?._id || home?.data?.homeId || home?._id || null;

  useEffect(() => {
    console.info("[useInsights] home changed", resolvedHome);

    // If no home in store, try to fetch it (will trigger this effect again)
    if (!home && !homeLoading) {
      console.info(
        "[useInsights] no home found in store — calling fetchMyHome()"
      );
      fetchMyHome().catch((e) => console.warn("fetchMyHome failed", e));
      return;
    }

    if (resolvedHome) {
      fetchInsightsForHome(resolvedHome, 12).catch((e) =>
        console.warn("fetchInsightsForHome failed", e)
      );
    }
  }, [resolvedHome, homeLoading]);

  return {
    insights,
    insightsLoading,
    insightsError,
    refresh: () =>
      resolvedHome ? fetchInsightsForHome(resolvedHome) : Promise.resolve(null),
  };
}
