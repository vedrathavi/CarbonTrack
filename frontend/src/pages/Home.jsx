import React, { useEffect, useState } from "react";
import useAppStore from "../stores/useAppStore";
import useHomeHook from "@/hooks/useHomeHook";

const Home = () => {
  const { userInfo, logout, clearUser } = useAppStore();
  const [loading, setLoading] = useState(false);

  const {
    home,
    homeLoading,
    homeError,
    homeStats,
    statsLoading,
    statsError,
    fetchMyHome,
    fetchHomeStats,
  } = useHomeHook();

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      if (!userInfo) return;
      const h = await fetchMyHome();
      if (mounted && h) {
        await fetchHomeStats();
      }
    };
    run();
    return () => {
      mounted = false;
    };
  }, [userInfo, fetchMyHome, fetchHomeStats]);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout(); // clears userInfo and logs out from backend
      clearUser(); // ensure userInfo is cleared from the store
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      {userInfo ? (
        <>
          <h1 className="text-2xl font-bold mb-4">
            Welcome back, {userInfo.firstName || userInfo.name}!
          </h1>
          <button
            onClick={handleLogout}
            disabled={loading}
            className={`px-4 py-2 rounded bg-red-600 text-white font-medium hover:bg-red-700 transition ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Logging out..." : "Logout"}
          </button>

          {/* Debug: Home details */}
          <div className="mt-6 p-4 bg-white border border-gray-200 rounded shadow-sm">
            <h2 className="text-lg font-semibold mb-2">Home details (debug)</h2>
            {homeLoading ? (
              <p className="text-sm text-gray-600">Loading home...</p>
            ) : homeError ? (
              <p className="text-sm text-red-600">{homeError}</p>
            ) : (
              <pre className="text-xs overflow-auto max-h-64">
                {JSON.stringify(home, null, 2)}
              </pre>
            )}
            <h3 className="text-md font-semibold mt-4 mb-2">
              Home stats (debug)
            </h3>
            {statsLoading ? (
              <p className="text-sm text-gray-600">Loading stats...</p>
            ) : statsError ? (
              <p className="text-sm text-red-600">{statsError}</p>
            ) : (
              <pre className="text-xs overflow-auto max-h-64">
                {JSON.stringify(homeStats, null, 2)}
              </pre>
            )}
          </div>
        </>
      ) : (
        <p>Please log in</p>
      )}
    </div>
  );
};

export default Home;
