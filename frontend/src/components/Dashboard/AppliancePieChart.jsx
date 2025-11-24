import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import { FiPieChart, FiZap } from "react-icons/fi";

const COLORS = [
  "#317233",
  "#4b8b4d",
  "#81bb83",
  "#a2cda4",
  "#7dd303",
  "#9afb0e",
  "#c3dfc4",
  "#e4f1e5",
];

function mapToData(obj) {
  if (!obj || typeof obj !== "object") return [];

  const entries = Object.entries(obj)
    .map(([k, v]) => ({
      name: k.charAt(0).toUpperCase() + k.slice(1).replace(/([A-Z])/g, " $1"),
      value: Number(v || 0),
      percentage: 0,
    }))
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value);

  // Calculate percentages
  const total = entries.reduce((sum, item) => sum + item.value, 0);
  return entries.map((item) => ({
    ...item,
    percentage: total > 0 ? (item.value / total) * 100 : 0,
  }));
}

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className=" bg-prim-100/50 rounded-xl p-3 shadow-lg">
        <div className="flex items-center gap-2 mb-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: data.payload.fill }}
          ></div>
          <p className="text-sm font-inter font-medium text-sec-800">
            {data.payload.name}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-lg font-instru text-prim-600">
            {data.value.toFixed(1)} kg
          </p>
          <p className="text-sm text-sec-800 font-inter">
            {data.payload.percentage.toFixed(1)}% of total
          </p>
        </div>
      </div>
    );
  }
  return null;
};

const CustomLegend = ({ payload }) => {
  return (
    <div className="flex flex-wrap gap-2 justify-center mt-4">
      {payload.map((entry, index) => (
        <div
          key={`legend-${index}`}
          className="flex items-center gap-2 bg-prim-50 px-3 py-1 rounded-full border border-prim-200"
        >
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          ></div>
          <span className="text-xs font-inter text-sec-700">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function AppliancePieChart({ applianceTotals = {} }) {
  const data = useMemo(() => mapToData(applianceTotals), [applianceTotals]);

  if (!data.length) {
    return (
      <div className="bg-neu-0 rounded-2xl border border-prim-200 p-6 h-120 flex flex-col items-center justify-center">
        <FiPieChart className="w-16 h-16 text-sec-400 mb-4" />
        <div className="text-sec-600 font-inter text-center">
          <div className="font-medium text-lg mb-2">No Appliance Data</div>
          <div className="text-sm">
            Appliance emission data will appear here
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-neu-0 rounded-2xl border border-prim-200 p-6 h-120">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-sec-100 rounded-xl flex items-center justify-center border border-sec-200">
          <FiZap className="w-6 h-6 text-sec-600" />
        </div>
        <div>
          <h3 className="font-inter font-medium text-sec-800 text-lg">
            Appliance Breakdown
          </h3>
          <p className="text-sm text-sec-600 font-inter">
            Today's emission sources distribution
          </p>
        </div>
      </div>

      {/* Chart Container */}
      <div className="h-65">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={120}
              paddingAngle={2}
              dataKey="value"
              nameKey="name"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  stroke="#ffffff"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <CustomLegend
        payload={data.map((item, index) => ({
          value: item.name,
          color: COLORS[index % COLORS.length],
          payload: item,
        }))}
      />
    </div>
  );
}
