import React, { useState } from "react";
import useAppStore from "../stores/useAppStore";

const Home = () => {
  const { userInfo, logout } = useAppStore();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout(); // clears userInfo and logs out from backend
      window.location.href = "/"; // redirect to landing page
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
        </>
      ) : (
        <p>Please log in</p>
      )}
    </div>
  );
};

export default Home;
