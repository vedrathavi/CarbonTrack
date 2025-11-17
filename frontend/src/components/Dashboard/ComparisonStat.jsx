import React from "react";

export default function ComparisonStat({ comparison }) {
  if (!comparison) return null;
  return (
    <div className="p-4 bg-white rounded shadow">
      <h4 className="text-sm text-gray-500">Comparison</h4>
      <div className="mt-2 text-lg">
        <div>Your avg: <strong>{comparison?.homeAvg} gCO2</strong></div>
        <div>Global avg: <strong>{comparison?.globalAvg} gCO2</strong></div>
      </div>
    </div>
  );
}
