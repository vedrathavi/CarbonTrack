import React from "react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function buildHourlyData(arr) {
  const a = Array.isArray(arr) ? arr : new Array(24).fill(0);
  return a.map((v, i) => ({ hour: i, value: Number(v || 0) }));
}

export default function HourlyLineChart({ hourly = null }) {
  if (!hourly) {
    return (
      <div className="p-4 bg-white rounded shadow h-64 flex items-center justify-center">
        <div className="text-sm text-gray-500">No data for today</div>
      </div>
    );
  }

  const data = buildHourlyData(hourly);
  return (
    <div className="p-4 bg-white rounded shadow" style={{ minHeight: 200 }}>
      <h4 className="text-sm text-sec-500 mb-2">Hourly CO₂ (gCO₂)</h4>
      <div style={{ width: "100%", height: 200 }}>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hour" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#4F46E5"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
