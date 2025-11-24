import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";

function aggregateWeeks(month) {
  if (!month || !Array.isArray(month.data)) return [];
  const days = month.data.map((d) => ({
    date: new Date(d.date),
    total: Number(d.total || 0) || 0,
  }));
  const result = [];
  for (let i = 0; i < days.length; i += 7) {
    const slice = days.slice(i, i + 7);
    const sum = slice.reduce((a, b) => a + (b.total || 0), 0);
    result.push({
      label: `Week ${result.length + 1}`,
      total: Number(sum.toFixed(2)),
    });
  }
  return result;
}

export default function WeeksBarChart({ month }) {
  const data = useMemo(() => aggregateWeeks(month), [month]);

  if (!data || !data.length) {
    return (
      <div className="h-40 flex flex-col items-center justify-center text-sec-500 font-inter text-sm">
        Not enough data for weekly aggregation
      </div>
    );
  }

  const colors = ["#317233", "#4b8b4d", "#81bb83", "#a2cda4"];

  return (
    <div className="h-40">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 12, left: 12, bottom: 6 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11 }}
            axisLine={false}
            label={{
              value: "Week",
              position: "insideBottom",
              offset: -3,
              style: { fontSize: 10, fill: "#64748b" },
            }}
          />
          <YAxis
            tick={{ fontSize: 11 }}
            axisLine={false}
            width={35}
            tickFormatter={(value) =>
              value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value.toFixed(0)
            }
            label={{
              value: "Emissions (g)",
              angle: -90,
              offset:-6,
              position: "insideLeft",
              style: { fontSize: 10, fill: "#64748b", textAnchor: "middle" },
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(235, 247, 235, 0.5)",
              borderRadius: "0.375rem",
              border: "none",
              boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
            }}
            formatter={(v) => [Number(v).toFixed(2) + " g", "Total"]}
          />
          <Bar dataKey="total" radius={[2, 2, 0, 0]}>
            {data.map((entry, idx) => (
              <Cell key={idx} fill={colors[idx % colors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
