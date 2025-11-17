import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

const COLORS = ["#4F46E5", "#06B6D4", "#F59E0B", "#EF4444", "#10B981", "#A78BFA", "#F472B6"];

function mapToData(obj) {
  if (!obj || typeof obj !== "object") return [];
  return Object.entries(obj).map(([k, v], i) => ({ name: k, value: Number(v || 0), color: COLORS[i % COLORS.length] }));
}

export default function AppliancePieChart({ applianceTotals = {} }) {
  const data = mapToData(applianceTotals);
  if (!data.length) return (
    <div className="p-4 bg-white rounded shadow h-64 flex items-center justify-center text-gray-500">No appliance data</div>
  );
  return (
    <div className="p-4 bg-white rounded shadow h-64">
      <h4 className="text-sm text-gray-500 mb-2">Appliance Breakdown</h4>
      <ResponsiveContainer width="100%" height="85%">
        <PieChart>
          <Pie dataKey="value" data={data} outerRadius={80} label={(entry) => `${entry.name} (${entry.value})`}>
            {data.map((entry, idx) => (
              <Cell key={`cell-${idx}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
