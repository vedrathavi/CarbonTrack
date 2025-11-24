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
  const generateInsightsForHome = useAppStore((s) => s.generateInsightsForHome);
  const resolvedHome =
    home?.data?.home?._id || home?.data?.homeId || home?._id || null;

  useEffect(() => {
   

    // If no home in store, try to fetch it (will trigger this effect again)
    if (!home && !homeLoading) {
      fetchMyHome().catch((e) => console.error("Failed to fetch home:", e));
      return;
    }

    if (resolvedHome) {
      fetchInsightsForHome(resolvedHome, 10)
        .then((existingInsights) => {
          if (!existingInsights || existingInsights.length === 0) {
            console.log("Generating initial insights for your home...");
            return generateInsightsForHome(resolvedHome, {}).catch((e) => {
              console.error("Could not generate insights:", e);
            });
          }
        })
        .catch((e) => console.error("Failed to load insights:", e));
    }
  }, [resolvedHome, homeLoading, home, fetchMyHome, fetchInsightsForHome, generateInsightsForHome]);

  const checkAndGenerate = async (homeId) => {
    if (!homeId) return Promise.resolve(null);
    
    try {
      const existingInsights = await fetchInsightsForHome(homeId, 10);
      
      const today = new Date();
      const todayUTC = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
      
      const hasInsightsToday = existingInsights && existingInsights.some((insight) => {
        const insightDate = new Date(insight.generatedAt || insight.createdAt);
        const insightUTC = Date.UTC(insightDate.getUTCFullYear(), insightDate.getUTCMonth(), insightDate.getUTCDate());
        return insightUTC === todayUTC;
      });
      
      if (hasInsightsToday) {
        console.log("Today's insights are already up to date");
        return existingInsights;
      }
      
      console.log("Generating fresh insights for today...");
      return await generateInsightsForHome(homeId, {});
    } catch (e) {
      console.error("Failed to refresh insights:", e);
      return null;
    }
  };

  return {
    insights,
    insightsLoading,
    insightsError,
    refresh: checkAndGenerate,
  };
}
