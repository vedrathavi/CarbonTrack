import React from "react";

import { FcGoogle } from "react-icons/fc";
import { AUTH_GOOGLE_LOGIN_ROUTE } from "../../utils/constants.js";
// import { useAppStore, useAuth } from "../../stores/useAppStore";
import { Button } from "@/components/ui/button.jsx";

import Loading from "../Loading.jsx";
import useAppStore from "@/stores/useAppStore.js";

export default function Landing() {
  const { userInfo, loading } = useAppStore();
  console.log("User Info:", userInfo);
  const redirectLogin = () => {
    window.location.href = AUTH_GOOGLE_LOGIN_ROUTE;
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <main className="w-screen h-screen bg-prim-500 flex flex-col items-center justify-start p-6 md:p-10 relative overflow-hidden">
      {/* 🏠 Hero */}
      <header className="text-center mt-10 flex flex-col items-center">
        <h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="font-instru text-6xl  md:text-8xl text-sec-700 leading-none tracking-tight"
        >
          Understand Your Impact.
          <br /> Reduce Your Footprint.
        </h1>

        <p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-4 text-sec-600 text-sm font-inter md:text-xl px-2 max-w-3xl"
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
          <Button
            onClick={redirectLogin}
            className="inline-flex items-center font-inter gap-3 bg-white/90 text-sec-900 px-6 py-6 rounded-md  hover:bg-white transition-all "
          >
            <div className="flex justify-center items-center gap-2">
              <FcGoogle className="size-6" />
              <span className="text-xl font-medium">Continue with Google</span>
            </div>
          </Button>
        </div>
      </header>
    </main>
  );
}
