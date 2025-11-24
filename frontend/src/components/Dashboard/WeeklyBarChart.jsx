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
import { FiCalendar } from "react-icons/fi";

function formatWeekData(week) {
  if (!week || !Array.isArray(week.data)) return [];
  return week.data.map((d) => ({
    date: d.date,
    label: new Date(d.date).toLocaleDateString("en-US", { weekday: "short" }),
    total: typeof d.total === "number" ? d.total : Number(d.total) || 0,
    fullDate: new Date(d.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
  }));
}

export default function WeeklyBarChart({ week }) {
  if (!week) {
    return (
      <div className="h-40 flex flex-col items-center justify-center text-sec-500 font-inter text-sm">
        <FiCalendar className="w-8 h-8 mb-2 text-sec-400" />
        No weekly data available
      </div>
    );
  }

  const data = formatWeekData(week);

  if (!data.length) {
    return (
      <div className="h-40 flex flex-col items-center justify-center text-sec-500 font-inter text-sm">
        <FiCalendar className="w-8 h-8 mb-2 text-sec-400" />
        Not enough historical data
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 12, left: -16, bottom: 6 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} axisLine={false} label={{ value: 'Days', position: 'insideBottom', offset: -3, style: { fontSize: 10, fill: '#64748b' } }} />
          <YAxis tick={{ fontSize: 11 }} axisLine={false} tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value.toFixed(0)} label={{ value: 'Emissions (g)', angle: -90, position: 'insideLeft', style: { fontSize: 10, fill: '#64748b', textAnchor: 'middle' } }} />
          <Tooltip
            contentStyle={{ backgroundColor: 'rgba(235, 247, 235, 0.5)', borderRadius: '0.375rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
            formatter={(v) => [Number(v).toFixed(2) + " kg", "Total"]}
            labelFormatter={(label, payload) => {
              if (payload && payload[0]) {
                return payload[0].payload.fullDate;
              }
              return label;
            }}
          />
          <Bar dataKey="total" fill="#4b8b4d" radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
