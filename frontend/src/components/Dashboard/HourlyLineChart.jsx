import React, { useMemo } from "react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
  Area,
} from "recharts";
import {
  FiActivity,
  FiClock,
  FiTrendingUp,
  FiTrendingDown,
} from "react-icons/fi";

function buildHourlyData(arr) {
  const a = Array.isArray(arr) ? arr : new Array(24).fill(0);
  const shortFormatter = new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
  });
  const fullFormatter = new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
  return a.map((v, i) => {
    const dt = new Date();
    dt.setHours(i, 0, 0, 0);
    return {
      hour: i,
      value: Number(v || 0),
      label: shortFormatter.format(dt),
      fullLabel: fullFormatter.format(dt),
    };
  });
}

function HourlyLineChartInner({ hourly = null }) {
  const data = useMemo(() => buildHourlyData(hourly), [hourly]);
  const currentHour = new Date().getHours();
  const currentPoint = useMemo(
    () => (data && data.length > currentHour ? data[currentHour] : null),
    [data, currentHour]
  );

  // Calculate stats
  const maxValue = useMemo(
    () => Math.max(...data.map((d) => d.value)) || 1,
    [data]
  );
  const minValue = useMemo(
    () => Math.min(...data.map((d) => d.value)) || 0,
    [data]
  );
  const avgValue = useMemo(
    () => data.reduce((sum, point) => sum + point.value, 0) / data.length,
    [data]
  );

  const yTicks = useMemo(() => {
    const min = Math.floor(minValue);
    const max = Math.ceil(maxValue);
    const steps = 6;
    if (max <= min) return [min, max];
    const step = Math.max(1, Math.ceil((max - min) / steps));
    const ticks = [];
    for (let v = min; v <= max; v += step) ticks.push(v);
    if (ticks[ticks.length - 1] < max) ticks.push(max);
    return ticks;
  }, [minValue, maxValue]);

  // Find peak hour
  const peakHour = useMemo(() => {
    const peak = data.reduce(
      (max, point) => (point.value > max.value ? point : max),
      data[0]
    );
    return { hour: peak.hour, value: peak.value };
  }, [data]);

  // Calculate trend
  const trend = useMemo(() => {
    if (data.length < 2) return "stable";
    const current = currentPoint?.value || 0;
    const previous = data[Math.max(0, currentHour - 1)]?.value || 0;
    return current > previous ? "up" : current < previous ? "down" : "stable";
  }, [data, currentHour, currentPoint]);

  // Remove interval blink (was causing continuous re-renders).
  // We're using a CSS animation on the ReferenceDot instead.

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const isCurrent = payload[0]?.payload?.hour === currentHour;
      return (
        <div className="bg-neu-0 border border-prim-200 rounded-xl p-4 shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <div
              className={`w-3 h-3 rounded-full ${
                isCurrent ? "bg-prim-500" : "bg-sec-400"
              }`}
            ></div>
            <p className="text-sm font-inter font-medium text-sec-800">
              {payload[0]?.payload?.fullLabel}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-lg font-instru text-prim-600">
              {payload[0].value.toFixed(1)}g
            </p>
            <p className="text-xs text-sec-600 font-inter">CO₂ Emissions</p>
          </div>
        </div>
      );
    }
    return null;
  };

  if (!hourly) {
    return (
      <div className="bg-neu-0 rounded-2xl border border-prim-200 p-6 h-120 flex flex-col items-center justify-center">
        <FiClock className="w-16 h-16 text-sec-400 mb-4" />
        <div className="text-sec-600 font-inter text-center">
          <div className="font-medium text-lg mb-2">No Hourly Data</div>
          <div className="text-sm">
            Real-time emissions data will appear here
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-neu-0 rounded-2xl border border-prim-200 p-6 h-120">
      <style>{`
        .pulse-dot { transform-origin: center; animation: pulse 1s infinite ease-in-out; }
        @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.25); } 100% { transform: scale(1); } }
      `}</style>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-prim-100 rounded-xl flex items-center justify-center border border-prim-200">
            <FiActivity className="w-6 h-6 text-prim-600" />
          </div>
          <div>
            <h3 className="font-inter font-medium text-sec-800 text-lg">
              Hourly Emissions Trend
            </h3>
            <p className="text-sm text-sec-600 font-inter">
              Real-time CO₂ tracking throughout the day
            </p>
          </div>
        </div>

        {/* Current hour indicator */}
        {currentPoint && (
          <div className="text-right">
            <div className="flex items-center gap-2 justify-end mb-1">
              <div className="w-2 h-2 bg-prim-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-inter font-medium text-sec-800">
                Now
              </span>
              <div
                className={`flex items-center gap-1 ${
                  trend === "up"
                    ? "text-red-500"
                    : trend === "down"
                    ? "text-green-500"
                    : "text-sec-500"
                }`}
              >
                {trend === "up" ? (
                  <FiTrendingUp className="w-3 h-3" />
                ) : trend === "down" ? (
                  <FiTrendingDown className="w-3 h-3" />
                ) : null}
              </div>
            </div>
            <div className="text-2xl font-instru text-prim-600">
              {currentPoint.value.toFixed(1)}g
            </div>
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
          >
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#317233" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#317233" stopOpacity={0.1} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#f0f0f0"
              vertical={false}
            />

            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#64748b" }}
              interval={2}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 14, fill: "#64748b" }}
              width={60}
              ticks={yTicks}
              tickFormatter={(value) => `${(value / 1000).toFixed(2)} kg`}
            />

            <Tooltip content={<CustomTooltip />} />

            {/* Area under the line */}
            <Area
              type="monotone"
              dataKey="value"
              stroke="none"
              fill="url(#colorValue)"
              fillOpacity={1}
            />

            {/* Main line with custom dot renderer to pulse current hour */}
            <Line
              type="monotone"
              dataKey="value"
              stroke="#317233"
              strokeWidth={3}
              dot={(dotProps) => {
                const { cx, cy, payload } = dotProps;
                if (payload?.hour === currentHour) {
                  // Render a group translated to the point, with an animated outer circle and inner filled circle
                  return (
                    <g transform={`translate(${cx},${cy})`}>
                      <g>
                        <circle
                          r={14}
                          fill="none"
                          stroke="#7dd303"
                          strokeWidth={2}
                        >
                          <animateTransform
                            attributeName="transform"
                            attributeType="XML"
                            type="scale"
                            values="1;1.25;1"
                            keyTimes="0;0.5;1"
                            dur="1.2s"
                            repeatCount="indefinite"
                            calcMode="spline"
                            keySplines="0.4 0 0.2 1;0.4 0 0.2 1"
                          />
                        </circle>
                        <circle
                          r={6}
                          fill="#7dd303"
                          stroke="#ffffff"
                          strokeWidth={2}
                        >
                          <animateTransform
                            attributeName="transform"
                            attributeType="XML"
                            type="scale"
                            values="1;1.35;1"
                            keyTimes="0;0.5;1"
                            dur="0.9s"
                            repeatCount="indefinite"
                            calcMode="spline"
                            keySplines="0.4 0 0.2 1;0.4 0 0.2 1"
                          />
                        </circle>
                      </g>
                    </g>
                  );
                }
                // default small dot
                return (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={3}
                    fill="#317233"
                    strokeWidth={2}
                  />
                );
              }}
              activeDot={{
                r: 6,
                fill: "#7dd303",
                stroke: "#ffffff",
                strokeWidth: 2,
              }}
            />

            {/* Peak hour indicator */}
            {peakHour.value > 0 && (
              <ReferenceDot
                x={peakHour.hour}
                y={peakHour.value}
                r={4}
                fill="#ef4444"
                stroke="#ffffff"
                strokeWidth={2}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Footer stats */}
      <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t border-prim-100">
        <div className="text-center">
          <div className="text-xs text-sec-600 font-inter mb-1">Current</div>
          <div className="text-sm font-inter font-medium text-prim-600">
            {currentPoint ? `${currentPoint.value.toFixed(1)}g` : "--"}
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs text-sec-600 font-inter mb-1">Peak</div>
          <div className="text-sm font-inter font-medium text-sec-800">
            {maxValue.toFixed(1)}g
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs text-sec-600 font-inter mb-1">Average</div>
          <div className="text-sm font-inter font-medium text-sec-800">
            {avgValue.toFixed(1)}g
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs text-sec-600 font-inter mb-1">Peak Time</div>
          <div className="text-sm font-inter font-medium text-sec-800">
            {data[peakHour.hour]?.label}
          </div>
        </div>
      </div>
    </div>
  );
}

function hourlyArrayEqual(a = [], b = []) {
  if (a === b) return true;
  if (!Array.isArray(a) || !Array.isArray(b)) return false;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++)
    if (Number(a[i] || 0) !== Number(b[i] || 0)) return false;
  return true;
}

export default React.memo(HourlyLineChartInner, (prev, next) =>
  hourlyArrayEqual(prev.hourly, next.hourly)
);
