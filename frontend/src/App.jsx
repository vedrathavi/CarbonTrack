import { useState } from "react";
import apiClient from "./lib/apiClient.js";
import {
  HOST,
  AUTH_GOOGLE_LOGIN_ROUTE,
  GET_USER_INFO,
  LOGOUT_ROUTE,
} from "./utils/constants.js";
import "./App.css";

function App() {
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  const redirectLogin = () => {
    // prefix with HOST so browser navigates to backend
    window.location.href = AUTH_GOOGLE_LOGIN_ROUTE;
    console.log("Redirecting to:", window.location.href);
  };

  const checkMe = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(GET_USER_INFO);
      console.log("User info:", res.data);
      setInfo(res.data);
    } catch (err) {
      setInfo({ error: err?.response?.data || err.message });
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiClient.get(LOGOUT_ROUTE);
      setInfo(null);
    } catch {
      // ignore
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-4">
      <h1 className="text-2xl font-bold">Auth quick test</h1>

      <div className="flex gap-2">
        <button
          onClick={redirectLogin}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Sign in (Redirect)
        </button>

        <button
          onClick={checkMe}
          className="px-4 py-2 bg-green-600 text-white rounded"
          disabled={loading}
        >
          {loading ? "Checking..." : "Check /api/auth/me"}
        </button>

        <button
          onClick={logout}
          className="px-4 py-2 bg-red-600 text-white rounded"
        >
          Logout
        </button>
      </div>

      <pre className="mt-4 max-w-xl w-full bg-gray-100 p-4 rounded text-sm">
        {info ? JSON.stringify(info, null, 2) : "No user info loaded"}
      </pre>
    </div>
  );
}

export default App;
