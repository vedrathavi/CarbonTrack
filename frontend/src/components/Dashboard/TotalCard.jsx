import React from "react";

export default function TotalCard({ summary }) {
  if (!summary) return null;
  return (
    <div className="p-4 bg-white rounded shadow">
      <h4 className="text-sm text-gray-500">Total CO₂ Today</h4>
      <div className="flex items-baseline gap-4">
        <div className="text-3xl font-bold">
          {summary.totalEmissions?.toFixed
            ? summary.totalEmissions.toFixed(2)
            : Number(summary.totalEmissions || 0).toFixed(2)}{" "}
          kg
        </div>
        <div className="text-sm text-gray-600">
          Top: {summary.topAppliance || "—"}
        </div>
      </div>
    </div>
  );
}
