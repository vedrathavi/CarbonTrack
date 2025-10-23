import React from "react";

import { FcGoogle } from "react-icons/fc";
import { AUTH_GOOGLE_LOGIN_ROUTE } from "../../utils/constants.js";
import { Button } from "@/components/ui/button.jsx";

import Loading from "../Loading.jsx";
import useAppStore from "@/stores/useAppStore.js";

// Import assets
import sunImg from "@/assets/sun.svg";
import starImg from "@/assets/linear-star.svg";
import plantImg from "@/assets/small-plant.svg";
import rainbowImg from "@/assets/rainbow.svg";

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
    <main className="min-h-screen bg-prim-500 flex flex-col items-center relative overflow-x-hidden">
      {/* Decorative Elements */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 0 }}
      >
        <img
          src={sunImg}
          alt=""
          className="absolute top-1 left-5 w-12  md:w-40  animate-spin-slow"
        />
        <img
          src={starImg}
          alt=""
          className="absolute top-[22%] right-[15%] w-12 animate-bounce-slow "
        />
        <img
          src={starImg}
          alt=""
          className="absolute top-[10%] right-[8%] w-16 animate-bounce-slow"
        />
        <img
          src={starImg}
          alt=""
          className="absolute top-1/5 left-[15%] w-8 h-8  animate-bounce-slow"
        />
        <img
          src={plantImg}
          alt=""
          className="absolute bottom-0 right-0 h-20 md:h-32 object-cover block"
        />
        <img
          src={rainbowImg}
          alt=""
          className="absolute bottom-0 left-0 h-20 md:h-36  object-cover block"
        />
      </div>

      {/* 🏠 Hero */}
      <header className="w-full text-center py-16 px-6 md:px-10 flex flex-col items-center relative z-10">
        <h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="font-instru text-6xl md:text-7xl lg:text-8xl text-sec-700 leading-tight tracking-tight max-w-5xl mx-auto"
        >
          Understand Your Impact.
          <br /> Reduce Your Footprint.
        </h1>

        <p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 text-sec-600 text-base sm:text-lg md:text-xl px-4 max-w-3xl mx-auto"
        >
          Easily track energy use, understand your carbon impact, and discover
          ways to live more sustainably.
        </p>

        <div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-10"
        >
          <div className="relative inline-block">
            <div className="absolute inset-0 translate-x-1 translate-y-1 bg-sec-900 rounded-md pointer-events-none"></div>
            <button
              onClick={redirectLogin}
              className="relative z-10 inline-flex items-center font-inter gap-3 bg-prim-100 border-sec-900 border-2 text-sec-900 px-6 py-3 rounded-md hover:bg-prim-100 hover:text-sec-800 transition-colors cursor-pointer"
            >
              <FcGoogle className="size-6" />
              <span className="text-xl font-medium">Continue with Google</span>
            </button>
          </div>
        </div>
      </header>

      {/* 🔄 How it Works */}
      <section className="w-full py-16 pb-40 px-6 md:px-10 relative z-10">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-instru text-sec-900 tracking-tight  mb-4">
            How it Works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Step 1 */}
            <div className="relative flex items-center gap-4 p-6 rounded-lg bg-gradient-to-b bg-prim-100/15 group hover:border-sec-900 hover:scale-105 ">
              <div className="relative">
                <div className="w-20 h-20 absolute inset-0 translate-x-1 translate-y-1 bg-sec-900 rounded-full"></div>
                <div className="w-20 h-20 relative flex items-center justify-center bg-prim-100  border-sec-900 border-2 text-sec-900 font-inter rounded-full text-4xl font-bold mb-4">
                  1
                </div>
              </div>
              <div className="flex flex-col items-start gap-0">
                <h3 className="text-2xl font-inter tracking-tight font-bold text-sec-700   mb-2">
                  Enter Household Details
                </h3>
                <p className="text-sec-500 font-inter ">
                  Rooms, appliances, and location information to get started.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative flex items-center gap-4 p-6 rounded-lg bg-gradient-to-b bg-prim-100/15 group hover:scale-105 transition-transform duration-200">
              <div className="relative">
                <div className="w-20 h-20 absolute inset-0 translate-x-1 translate-y-1 bg-sec-900 rounded-full"></div>
                <div className="w-20 h-20 relative flex items-center justify-center bg-prim-100  border-sec-900 border-2 text-sec-900 font-inter rounded-full text-4xl font-bold mb-4">
                  2
                </div>
              </div>
              <div className="flex flex-col items-start gap-0">
                <h3 className="text-2xl font-inter tracking-tight font-bold text-sec-700 mb-2">
                  We Simulate Usage
                </h3>
                <p className="text-sec-500 font-inter">
                  Our system mimics IoT device data and fetches emission
                  factors.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative flex items-center gap-4 p-6 rounded-lg bg-gradient-to-b bg-prim-100/15 group hover:scale-105 hotransition-transform duration-200 ">
              <div className="relative">
                <div className="w-20 h-20 absolute inset-0 translate-x-1 translate-y-1 bg-sec-900 rounded-full"></div>
                <div className="w-20 h-20 relative flex items-center justify-center bg-prim-100  border-sec-900 border-2 text-sec-900 font-inter rounded-full text-4xl font-bold mb-4">
                  3
                </div>
              </div>
              <div className="flex flex-col items-start gap-0">
                <h3 className="text-2xl font-inter tracking-tight font-bold text-sec-700 mb-2">
                  View Dashboard
                </h3>
                <p className="text-sec-500 font-inter">
                  Track trends, identify big contributors, and get tips to
                  reduce your footprint.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
