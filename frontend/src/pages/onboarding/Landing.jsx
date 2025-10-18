import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { AUTH_GOOGLE_LOGIN_ROUTE } from "../../utils/constants.js";
import { useAppStore } from "../../stores/useAppStore";

export default function Landing() {
  const navigate = useNavigate();
  const { userInfo, loading, fetchUser } = useAppStore();

  const redirectLogin = () => {
      window.location.href = AUTH_GOOGLE_LOGIN_ROUTE;
      
  };

  if (loading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center text-emerald-900">
        Loading...
      </div>
    );
  }

  return (
    <main className="w-screen h-screen bg-lime-400 flex flex-col items-center justify-start p-6 md:p-10 relative overflow-hidden">
      {/* 🌞 Decorative sun */}
      <div className="absolute left-10 top-8">
        <div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="w-16 h-16 rounded-full bg-orange-400 flex items-center justify-center shadow-md"
        >
          <div className="w-6 h-6 rounded-full bg-emerald-900" />
        </div>
      </div>

      {/* 🏠 Hero */}
      <header className="text-center mt-10 max-w-3xl">
        <h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="font-serif text-4xl md:text-6xl text-emerald-900 leading-tight"
        >
          Understand Your Impact.
          <br /> Reduce Your Footprint.
        </h1>

        <p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-4 text-emerald-900/80 text-sm md:text-base px-2"
        >
          Easily track energy use, understand your carbon impact, and discover
          ways to live more sustainably.
        </p>

        <div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8"
        >
          <button
            onClick={redirectLogin}
            className="inline-flex items-center gap-3 bg-white/90 text-emerald-900 px-5 py-2.5 rounded-lg shadow-md hover:scale-[1.03] hover:bg-white transition-all focus:outline-none focus:ring-2 focus:ring-emerald-700"
          >
            <span className="text-sm font-medium">Continue with Google</span>
          </button>
        </div>
      </header>
    </main>
  );
}
