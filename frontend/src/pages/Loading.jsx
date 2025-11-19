import React from "react";

const Loading = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neu-0 via-prim-100 to-sec-100 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient Orbs */}
        <div className="absolute top-20 left-20 w-64 h-64 bg-prim-300/40 rounded-full blur-3xl animate-orb-float-slow"></div>
        <div className="absolute bottom-20 right-20 w-72 h-72 bg-sec-300/30 rounded-full blur-3xl animate-orb-float-medium delay-2000"></div>

        {/* Subtle Grid */}
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(90deg,var(--color-sec-600)_1px,transparent_1px),linear-gradient(180deg,var(--color-sec-600)_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_60%)]"></div>
      </div>

      {/* Main Content */}
      <div className="text-center space-y-16 relative z-10">
        {/* Animated Carbon Cycle */}
        <div className="relative mx-auto w-72 h-72">
          {/* Central Icon */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-gradient-to-br from-prim-600 to-sec-600 rounded-full shadow-lg shadow-prim-400/30 flex items-center justify-center animate-pulse-gentle">
            <div className="w-8 h-8 bg-white rounded-full"></div>
          </div>

          {/* Orbiting Leaves */}
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            >
              <div
                className="w-6 h-6 bg-gradient-to-br from-prim-500 to-sec-500 rounded-full shadow-md shadow-prim-400/40 animate-leaf-orbit"
                style={{
                  animationDelay: `${i * 1.2}s`,
                  transform: `rotate(${i * 120}deg) translateX(100px)`,
                }}
              ></div>
            </div>
          ))}

          {/* Connection Ring */}
          <svg className="absolute inset-0 w-full h-full animate-spin-slow">
            <circle
              cx="50%"
              cy="50%"
              r="100"
              fill="none"
              stroke="url(#ringGradient)"
              strokeWidth="2"
              strokeDasharray="8 4"
              opacity="0.6"
            />
            <defs>
              <linearGradient
                id="ringGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="var(--color-prim-500)" />
                <stop offset="100%" stopColor="var(--color-sec-500)" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Text Content */}
        <div className="space-y-6">
          <h1 className="text-5xl font-instru text-sec-800 tracking-tight">
            Carbon
            <span className="block text-transparent bg-gradient-to-r from-prim-600 to-sec-600 bg-clip-text animate-gradient-shift mt-2">
              Track
            </span>
          </h1>

          <p className="text-sec-600 text-lg font-inter font-light">
            Setting up carbon calculations...
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="space-y-8">
          {/* Elegant Progress Bar */}
          <div className="w-80 mx-auto h-1.5 bg-sec-200 rounded-full overflow-hidden shadow-inner">
            <div className="h-full bg-gradient-to-r from-prim-500 via-sec-500 to-prim-500 rounded-full animate-progress-flow"></div>
          </div>

          {/* Status Text */}
          <div className="text-sec-700 text-sm font-inter font-medium tracking-wide animate-pulse">
            ANALYZING ENERGY CONSUMPTION...
          </div>
        </div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1.5 h-1.5 bg-prim-400/50 rounded-full animate-particle-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: `${4 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Corner Accents */}
      <div className="absolute top-8 left-8 w-4 h-4 bg-prim-400/30 rounded-full animate-ping-slow"></div>
      <div className="absolute bottom-8 right-8 w-3 h-3 bg-sec-400/40 rounded-full animate-ping-slow delay-1000"></div>
    </div>
  );
};

export default Loading;
