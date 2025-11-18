import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
  ReferenceLine,
} from "recharts";

function formatMonthData(month) {
  if (!month || !Array.isArray(month.data)) return [];
  return month.data.map((d) => ({
    date: d.date,
    label: new Date(d.date).getDate(),
    total: typeof d.total === "number" ? d.total : Number(d.total) || 0,
    fullDate: new Date(d.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
  }));
}

export default function MonthlyBarChart({ month }) {
  const data = useMemo(() => formatMonthData(month), [month]);

  const monthlyAvg = useMemo(() => {
    if (!data || !data.length) return 0;
    const s = data.reduce((a, b) => a + (Number(b.total) || 0), 0);
    return Number((s / data.length).toFixed(2));
  }, [data]);

  if (!month) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-sec-500 font-inter">
        <div className="text-sm">No monthly data available</div>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-sec-500 font-inter">
        <div className="text-sm">Not enough historical data</div>
      </div>
    );
  }

  const colors = ["#317233", "#4b8b4d", "#81bb83", "#a2cda4"];

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 12, left: -20, bottom: 6 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} axisLine={false} />
          <YAxis tick={{ fontSize: 11 }} axisLine={false} width={35} />
          <Tooltip
            formatter={(v) => [Number(v).toFixed(2) + " g", "Total"]}
            labelFormatter={(label, payload) => {
              if (payload && payload[0]) {
                return payload[0].payload.fullDate;
              }
              return label;
            }}
          />
          <ReferenceLine
            y={monthlyAvg}
            stroke="#f37f07"
            strokeDasharray="3 3"
            label={{
              value: `Avg ${monthlyAvg}g`,
              position: "insideTopRight",
              fill: "#f37f07",
              fontSize: 10,
            }}
          />
          <Bar dataKey="total" radius={[2, 2, 0, 0]}>
            {data.map((entry, idx) => {
              const seg = Math.floor(idx / 7);
              const fill = colors[seg % colors.length];
              return <Cell key={`cell-${idx}`} fill={fill} />;
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
