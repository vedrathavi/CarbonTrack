import useAppStore from "@/stores/useAppStore";

// Convenience hook to access home state and actions
export default function useHomeHook() {
  const home = useAppStore((s) => s.home);
  const homeLoading = useAppStore((s) => s.homeLoading);
  const homeError = useAppStore((s) => s.homeError);

  const homeStats = useAppStore((s) => s.homeStats);
  const statsLoading = useAppStore((s) => s.statsLoading);
  const statsError = useAppStore((s) => s.statsError);

  const fetchMyHome = useAppStore((s) => s.fetchMyHome);
  const fetchHomeStats = useAppStore((s) => s.fetchHomeStats);
  const updateHome = useAppStore((s) => s.updateHome);
  const setHome = useAppStore((s) => s.setHome);
  const clearHome = useAppStore((s) => s.clearHome);

  return {
    // state
    home,
    homeLoading,
    homeError,
    homeStats,
    statsLoading,
    statsError,

    // actions
    fetchMyHome,
    fetchHomeStats,
    updateHome,
    setHome,
    clearHome,
  };
}
