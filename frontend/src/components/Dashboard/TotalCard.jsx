import React from "react";
import { FiTrendingUp, FiActivity, FiCalendar, FiTarget } from "react-icons/fi";

export default function TotalCard({ summary }) {
  if (!summary) return null;

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "morning";
    if (hour < 18) return "afternoon";
    return "evening";
  };

  const getMotivationalMessage = (emissions) => {
    if (emissions < 5000) return "Great job! You're on track";
    if (emissions < 10000) return "Good progress today";
    return "Let's work on reducing this";
  };

  const timeOfDay = getTimeOfDay();
  const motivationalMessage = getMotivationalMessage(
    summary.totalEmissions || 0
  );

  return (
    <div className="bg-gradient-to-br from-sec-700 to-prim-800 rounded-2xl p-6 text-neu-0 relative overflow-hidden group hover:transform hover:scale-[1.02] transition-all duration-300">
      {/* Animated background elements */}
      <div className="absolute top-0 right-0 w-28 h-28 bg-prim-500/20 rounded-full -translate-y-14 translate-x-14 group-hover:scale-110 transition-transform duration-500"></div>
      <div className="absolute bottom-0 left-0 w-20 h-20 bg-prim-500/20 rounded-full translate-y-10 -translate-x-10 group-hover:scale-110 transition-transform duration-500"></div>
      <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-sec-600/10 rounded-full -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      <div className="relative z-10">
        {/* Header with greeting */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-prim-500/30 rounded-xl flex items-center justify-center border border-prim-400/30 group-hover:bg-prim-500/40 transition-colors">
              <FiActivity className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-inter font-medium text-lg">
                Good {timeOfDay}!
              </h3>
              <p className="text-prim-200 text-sm">Your carbon footprint</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <FiCalendar className="w-4 h-4 text-prim-200" />
            <span className="text-sm text-prim-200 font-inter">Today</span>
          </div>
        </div>

        {/* Main Emission Value */}
        <div className="space-y-3 mb-6">
          <div className="flex items-end gap-3">
            <div className="text-4xl md:text-5xl font-inter font-bold tracking-tight leading-none">
              {summary.totalEmissions?.toFixed
                ? summary.totalEmissions.toFixed(1)
                : Number(summary.totalEmissions || 0).toFixed(1)}
            </div>
            <div className="text-lg font-inter font-medium text-prim-200 mb-1">
              gCO₂
            </div>
          </div>
          <div className="text-prim-200/80 text-sm font-inter">
            {motivationalMessage}
          </div>
        </div>

        {/* Progress Section */}
        <div className="space-y-4">
          {/* Quick Insight */}
          <div className="flex items-center gap-3 p-3 bg-prim-600/20 rounded-xl border border-prim-500/30">
            <FiTrendingUp className="w-4 h-4 text-prim-300 flex-shrink-0" />
            <div className="text-xs text-prim-200 font-inter">
              You're emitting{" "}
              <span className="font-bold text-prim-300">42% less</span> than
              yesterday
            </div>
          </div>
        </div>
      </div>

      {/* Subtle shine effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
    </div>
  );
}
