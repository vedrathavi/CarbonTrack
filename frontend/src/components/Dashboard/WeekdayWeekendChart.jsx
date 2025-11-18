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

function computeAverages(month) {
  if (!month || !Array.isArray(month.data)) return null;
  let weekdaySum = 0,
    weekdayCount = 0,
    weekendSum = 0,
    weekendCount = 0;

  for (const d of month.data) {
    const date = new Date(d.date);
    const dow = date.getUTCDay();
    const total = Number(d.total || d.total || 0) || 0;
    if (dow === 0 || dow === 6) {
      weekendSum += total;
      weekendCount++;
    } else {
      weekdaySum += total;
      weekdayCount++;
    }
  }

  const weekdayAvg = weekdayCount ? weekdaySum / weekdayCount : 0;
  const weekendAvg = weekendCount ? weekendSum / weekendCount : 0;
  return { weekdayAvg, weekendAvg };
}

export default function WeekdayWeekendChart({ month }) {
  const avgs = useMemo(() => computeAverages(month), [month]);

  if (!avgs) {
    return (
      <div className="h-40 flex flex-col items-center justify-center text-sec-500 font-inter text-sm">
        No monthly data available
      </div>
    );
  }

  const data = [
    { name: "Weekday", value: Number(avgs.weekdayAvg.toFixed(2)) },
    { name: "Weekend", value: Number(avgs.weekendAvg.toFixed(2)) },
  ];

  const colors = ["#317233", "#81bb83"];

  return (
    <div className="h-40">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 8, right: 12, left: 0, bottom: 6 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#f0f0f0"
            vertical={false}
          />
          {/* numeric axis (values) */}
          <XAxis
            type="number"
            tick={{ fontSize: 11 }}
            axisLine={false}
            tickFormatter={(v) => `${v}g`}
          />
          {/* categorical axis (names) */}
          <YAxis
            dataKey="name"
            type="category"
            axisLine={false}
            tick={{ fontSize: 11 }}
            width={80}
          />
          <Tooltip
            formatter={(v) => [Number(v).toFixed(2) + " g", "Average"]}
          />
          <Bar dataKey="value" barSize={50} radius={4}>
            {data.map((entry, idx) => (
              <Cell key={idx} fill={colors[idx % colors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
