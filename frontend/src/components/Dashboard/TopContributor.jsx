import React from "react";
import {
  FiAward,
  FiTrendingUp,
  FiZap,
  FiPieChart,
  FiAlertTriangle,
} from "react-icons/fi";

export default function TopContributor({
  applianceTotals = {},
  topAppliance = null,
}) {
  let name = topAppliance || null;
  let value = 0;
  let percentage = 0;

  // Calculate total emissions and find top contributor
  const entries = Object.entries(applianceTotals || {});
  const totalEmissions = entries.reduce(
    (sum, [, val]) => sum + Number(val || 0),
    0
  );

  if (!name && entries.length) {
    entries.sort((a, b) => Number(b[1] || 0) - Number(a[1] || 0));
    name = entries[0][0];
    value = Number(entries[0][1] || 0);
  } else if (name) {
    value = Number((applianceTotals && applianceTotals[name]) || 0);
  }

  // Calculate percentage of total emissions
  if (totalEmissions > 0) {
    percentage = (value / totalEmissions) * 100;
  }

  // Format appliance name for display
  const formatApplianceName = (applianceName) => {
    return applianceName
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  // Get impact level and suggestions
  const getImpactInfo = (percent) => {
    if (percent > 50) {
      return {
        level: "High Impact",
        color: "text-red-200",
        bgColor: "bg-red-500/20",
        borderColor: "border-red-400/30",
        icon: FiAlertTriangle,
        suggestion:
          "Consider reducing usage or upgrading to energy-efficient model",
      };
    } else if (percent > 25) {
      return {
        level: "Medium Impact",
        color: "text-amber-200",
        bgColor: "bg-amber-500/20",
        borderColor: "border-amber-400/30",
        icon: FiPieChart,
        suggestion: "Optimize usage patterns for better efficiency",
      };
    } else {
      return {
        level: "Low Impact",
        color: "text-green-200",
        bgColor: "bg-green-500/20",
        borderColor: "border-green-400/30",
        icon: FiZap,
        suggestion: "Well managed - maintain current usage levels",
      };
    }
  };

  const impact = getImpactInfo(percentage);
  const ImpactIcon = impact.icon;

  if (!name) {
    return (
      <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-6 text-neu-0 relative overflow-hidden group hover:transform hover:scale-[1.02] transition-all duration-300">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform duration-500"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-amber-400/10 rounded-full translate-y-12 -translate-x-12 group-hover:scale-110 transition-transform duration-500"></div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-amber-400/20 rounded-xl flex items-center justify-center border border-amber-300/30">
                <FiAward className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-inter font-medium text-lg">
                  Top Contributor
                </h3>
                <p className="text-amber-100 text-sm">
                  Highest emitting appliance
                </p>
              </div>
            </div>
          </div>
          <div className="text-center py-8">
            <FiZap className="w-16 h-16 mx-auto mb-4 text-amber-200" />
            <div className="text-amber-100 font-inter text-lg mb-2">
              No Data Yet
            </div>
            <div className="text-amber-200 text-sm">
              Start using appliances to see insights
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-amber-600 to-amber-700 rounded-2xl p-6 text-neu-0 relative overflow-hidden group hover:transform hover:scale-[1.02] transition-all duration-300">
      {/* Animated background elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform duration-500"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-amber-400/10 rounded-full translate-y-12 -translate-x-12 group-hover:scale-110 transition-transform duration-500"></div>
      <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-amber-400/5 rounded-full -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-400/20 rounded-xl flex items-center justify-center border border-amber-300/30 group-hover:bg-amber-400/30 transition-colors">
              <FiAward className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-inter font-medium text-lg">
                Top Contributor
              </h3>
              <p className="text-amber-100 text-sm">
                Highest emitting appliance
              </p>
            </div>
          </div>
          <FiTrendingUp className="w-6 h-6 text-amber-200" />
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Appliance Name and Value */}
          <div className="space-y-3">
            <div className="text-3xl md:text-4xl font-inter font-bold leading-tight capitalize">
              {formatApplianceName(name)}
            </div>
            <div className="flex items-baseline gap-3">
              <div className="text-2xl font-inter font-semibold">
                {value.toFixed(1)}
              </div>
              <div className="text-amber-100 font-inter text-lg">
                gCO₂ today
              </div>
            </div>
          </div>

          {/* Contribution Progress */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-amber-100 font-inter">
                Contribution to Total
              </span>
              <span className="font-inter font-bold text-amber-200">
                {percentage.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-amber-400/30 rounded-full h-3">
              <div
                className="bg-amber-200 h-3 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${Math.min(percentage, 100)}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-amber-200">
              <span>0%</span>
              <span>Total: {totalEmissions.toFixed(1)}g</span>
              <span>100%</span>
            </div>
          </div>

        
        </div>
      </div>

      {/* Subtle shine effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
    </div>
  );
}
