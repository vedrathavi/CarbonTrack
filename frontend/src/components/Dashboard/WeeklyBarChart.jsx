import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

function formatWeekData(week) {
  if (!week || !Array.isArray(week.data)) return [];
  return week.data.map((d) => ({
    date: d.date,
    label: new Date(d.date).toLocaleDateString(),
    total: typeof d.total === "number" ? d.total : Number(d.total) || 0,
    topAppliance: d.topAppliance || null,
  }));
}

export default function WeeklyBarChart({ week }) {
  if (!week) {
    return (
      <div className="p-4 bg-white rounded shadow h-64 flex items-center justify-center">
        <div className="text-sm text-gray-500">No weekly data available</div>
      </div>
    );
  }

  const data = formatWeekData(week);

  if (!data.length) {
    return (
      <div className="p-4 bg-white rounded shadow h-64 flex items-center justify-center">
        <div className="text-sm text-gray-500">Not enough historical data</div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded shadow" style={{ minHeight: 240 }}>
      <h4 className="text-sm text-gray-500 mb-2">Last {week.days} Days — Total CO₂ (kg)</h4>
      <div style={{ width: "100%", height: 200 }}>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} margin={{ top: 10, right: 12, left: 0, bottom: 6 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip formatter={(v) => [Number(v).toFixed(2) + ' kg', 'Total']} />
            <Bar dataKey="total" fill="#4F46E5" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
