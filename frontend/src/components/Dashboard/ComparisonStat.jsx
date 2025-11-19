import React from "react";
import { FiGlobe, FiHome, FiTrendingUp, FiTrendingDown } from "react-icons/fi";

export default function ComparisonStat({ comparison }) {
  if (!comparison) return null;

  const isBetter = comparison?.homeAvg < comparison?.globalAvg;
  const difference = comparison?.globalAvg - comparison?.homeAvg;
  const percentageDiff =
    comparison?.globalAvg > 0
      ? (Math.abs(difference) / comparison.globalAvg) * 100
      : 0;

  return (
    <div className="bg-gradient-to-br from-sec-600 to-sec-700 rounded-2xl p-5 text-neu-0 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-sec-500/20 rounded-full -translate-y-10 translate-x-10"></div>
      <div className="absolute bottom-0 left-0 w-16 h-16 bg-sec-500/20 rounded-full translate-y-8 -translate-x-8"></div>

      <div className="relative z-10">
        {/* Header - More Compact */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-sec-500/30 rounded-xl flex items-center justify-center border border-sec-400/30">
              <FiGlobe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-inter font-medium text-base">
                Global Comparison
              </h3>
              <p className="text-sec-200 text-xs">How you stack up worldwide</p>
            </div>
          </div>
          {isBetter ? (
            <FiTrendingDown className="w-5 h-5 text-green-300" />
          ) : (
            <FiTrendingUp className="w-5 h-5 text-amber-300" />
          )}
        </div>

        {/* Comparison Bars - More Compact */}
        <div className="space-y-3 mb-4">
          {/* Your Average */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <FiHome className="w-3 h-3 text-sec-200" />
                <span className="text-sec-200 font-inter">Your Average</span>
              </div>
              <span className="font-inter font-bold text-base">
                {comparison?.homeAvg} g
              </span>
            </div>
            <div className="w-full bg-sec-500/40 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-prim-400 to-prim-500 h-2 rounded-full transition-all duration-1000"
                style={{
                  width: `${Math.min(
                    (comparison?.homeAvg / (comparison?.globalAvg * 1.5)) * 100,
                    100
                  )}%`,
                }}
              ></div>
            </div>
          </div>

          {/* Global Average */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <FiGlobe className="w-3 h-3 text-sec-200" />
                <span className="text-sec-200 font-inter">Global Average</span>
              </div>
              <span className="font-inter font-bold text-base">
                {comparison?.globalAvg} g
              </span>
            </div>
            <div className="w-full bg-sec-500/40 rounded-full h-2">
              <div
                className="bg-sec-300 h-2 rounded-full"
                style={{ width: "100%" }}
              ></div>
            </div>
          </div>
        </div>

        {/* Difference Indicator - More Compact */}
        <div
          className={`text-center p-3 rounded-lg border ${
            isBetter
              ? "bg-green-500/20 border-green-400/30 text-green-200"
              : "bg-amber-500/20 border-amber-400/30 text-amber-200"
          }`}
        >
          <div className="flex items-center justify-center gap-1 mb-1">
            {isBetter ? (
              <>
                <FiTrendingDown className="w-3 h-3" />
                <span className="font-inter font-bold text-sm">
                  {percentageDiff.toFixed(1)}% Better
                </span>
              </>
            ) : (
              <>
                <FiTrendingUp className="w-3 h-3" />
                <span className="font-inter font-bold text-sm">
                  {percentageDiff.toFixed(1)}% Higher
                </span>
              </>
            )}
          </div>
          <div className="text-xs font-inter">
            {isBetter ? "Better than global average" : "Reduce your footprint"}
          </div>
        </div>

        {/* Quick Stats - More Compact */}
        <div className="grid grid-cols-2 gap-2 mt-3">
          <div className="text-center p-2 bg-sec-500/20 rounded-lg border border-sec-400/20">
            <div className="text-xs text-sec-200 mb-1">Difference</div>
            <div className="text-sm font-inter font-bold">
              {Math.abs(difference).toFixed(1)}g
            </div>
          </div>
          <div className="text-center p-2 bg-sec-500/20 rounded-lg border border-sec-400/20">
            <div className="text-xs text-sec-200 mb-1">Status</div>
            <div
              className={`text-sm font-inter font-bold ${
                isBetter ? "text-green-300" : "text-amber-300"
              }`}
            >
              {isBetter ? "Ahead" : "Catch Up"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
