import { useEffect, useState, useRef, useCallback } from "react";
import api from "../lib/apiClient";
import { io } from "socket.io-client";
import {
  getDashboardToday,
  getDashboardWeek,
  getDashboardMonth,
  getDashboardComparison,
  getSimulationLatestRoute,
  getSimulationHourlyRoute,
} from "../utils/constants";
const DBG = "useDashboardData";

function normalizeHourlyArray(arr) {
  if (!Array.isArray(arr)) return new Array(24).fill(0);
  if (arr.length === 24) return arr.map((v) => Number(v || 0));
  const out = new Array(24).fill(0);
  for (let i = 0; i < Math.min(24, arr.length); i++)
    out[i] = Number(arr[i] || 0);
  return out;
}

export default function useDashboardData(homeId) {
  const [loading, setLoading] = useState(false);
  const [today, setToday] = useState(null);
  const [week, setWeek] = useState(null);
  const [month, setMonth] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [error, setError] = useState(null);
  const socketRef = useRef(null);
  const resolvedHomeRef = useRef(null);

  useEffect(() => {
    if (!homeId) return;
    let mounted = true;
    setLoading(true);

    async function fetchToday() {
      try {
        // primary: dashboard today
        const dashboardUrl = getDashboardToday(homeId);
        const res = await api.get(dashboardUrl);

        if (!mounted) return;
        if (res?.data?.data) {
          const d = res.data.data;
          d.totalHourly = normalizeHourlyArray(d.totalHourly);
          setToday(d);
          // capture server-resolved home id (ObjectId) for socket room
          if (d.homeId) resolvedHomeRef.current = String(d.homeId);

          // initialize socket and join room
          try {
            const SOCKET_URL =
              import.meta.env.VITE_API_WS_URL || window.location.origin;
            if (!socketRef.current) {
              const s = io(SOCKET_URL, { withCredentials: true });
              socketRef.current = s;
              s.on("connect", () => {
                if (resolvedHomeRef.current)
                  s.emit("joinHome", { homeId: resolvedHomeRef.current });
              });
              s.on("hourly-emission-update", (payload) => {
                if (!payload) return;
                if (
                  !resolvedHomeRef.current ||
                  String(payload.homeId) !== String(resolvedHomeRef.current)
                )
                  return;
                // full-day payload
                if (payload.fullDay) {
                  const fd = payload.fullDay;
                  fd.totalHourly = normalizeHourlyArray(fd.totalHourly);
                  setToday(fd);
                  return;
                }
                // patch hourly
                setToday((prev) => {
                  if (!prev) return prev;
                  const next = { ...prev };
                  next.totalHourly = normalizeHourlyArray(
                    next.totalHourly || []
                  );
                  const idx = Number(payload.hour);
                  if (!Number.isNaN(idx) && idx >= 0 && idx < 24) {
                    next.totalHourly = next.totalHourly.map((v, i) =>
                      i === idx ? Number(payload.total || 0) : v
                    );
                  }
                  if (payload.perAppliance) {
                    next.emissions = next.emissions || {};
                    next.applianceTotals = next.applianceTotals || {};
                    for (const [k, v] of Object.entries(payload.perAppliance)) {
                      const arr = Array.isArray(next.emissions[k])
                        ? [...next.emissions[k]]
                        : new Array(24).fill(0);
                      if (!Number.isNaN(idx) && idx >= 0 && idx < 24)
                        arr[idx] = Number(v || 0);
                      next.emissions[k] = arr;
                      next.applianceTotals[k] = Number(
                        arr.reduce((a, b) => a + (Number(b) || 0), 0).toFixed(2)
                      );
                    }
                  }
                  next.summary = next.summary || {};
                  next.summary.totalEmissions = Number(
                    next.totalHourly
                      .reduce((a, b) => a + (Number(b) || 0), 0)
                      .toFixed(2)
                  );
                  return next;
                });
              });
            } else if (socketRef.current && resolvedHomeRef.current) {
              socketRef.current.emit("joinHome", {
                homeId: resolvedHomeRef.current,
              });
            }
          } catch {
            // ignore socket errors
          }

          setLoading(false);
          return;
        }

        // fallback: simulation latest
        try {
          const latestUrl = getSimulationLatestRoute(homeId);
          const latest = await api.get(latestUrl);

          if (latest?.data?.doc) {
            const doc = latest.data.doc;
            const normalized = {
              date: doc.date,
              totalHourly: normalizeHourlyArray(doc.totalHourly),
              summary: {
                totalEmissions: doc.summary?.totalEmissions || 0,
                topAppliance: doc.summary?.topAppliance || null,
              },
              applianceTotals: {},
              emissions: doc.emissions || {},
            };
            setToday(normalized);
            if (doc.homeId) {
              try {
                const SOCKET_URL =
                  import.meta.env.VITE_SERVER_URL || window.location.origin;
                if (!socketRef.current) {
                  const s = io(SOCKET_URL, { withCredentials: true });
                  socketRef.current = s;
                  s.on("connect", () =>
                    s.emit("joinHome", { homeId: String(doc.homeId) })
                  );
                  s.on("hourly-emission-update", () => {});
                } else {
                  socketRef.current.emit("joinHome", {
                    homeId: String(doc.homeId),
                  });
                }
                resolvedHomeRef.current = String(doc.homeId);
              } catch {
                // ignore
              }
            }
            setLoading(false);
            return;
          }
        } catch (err) {
          console.error(`${DBG}: simulation.latest fallback failed`, err);
        }

        // final fallback: hourly simulate
        try {
          const qs = new URLSearchParams();
          qs.set("simulate", "true");
          const hourlyUrl = getSimulationHourlyRoute(homeId, qs.toString());
          const hourly = await api.get(hourlyUrl);

          if (hourly?.data) {
            const d = hourly.data;
            if (typeof d.hour === "number") {
              const arr = new Array(24).fill(0);
              arr[d.hour] = Number(d.total) || 0;
              const emissions = {};
              if (d.perAppliance) {
                for (const [k, v] of Object.entries(d.perAppliance)) {
                  const a = new Array(24).fill(0);
                  a[d.hour] = Number(v) || 0;
                  emissions[k] = a;
                }
              }
              setToday({
                date: d.date,
                totalHourly: arr,
                summary: {
                  totalEmissions: arr.reduce((a, b) => a + (Number(b) || 0), 0),
                },
                applianceTotals: {},
                emissions,
              });
              setLoading(false);
              return;
            }
          }
        } catch (err) {
          console.error(`${DBG}: simulation.hourly fallback failed`, err);
        }

        setLoading(false);
      } catch (err) {
        console.error(`${DBG}: fetchToday top-level error`, err);
        setError(
          err?.response?.data?.message ||
            err.message ||
            "Failed to fetch dashboard data"
        );
        setLoading(false);
      }
    }

    fetchToday();

    return () => {
      mounted = false;
      if (socketRef.current) {
        try {
          socketRef.current.disconnect();
        } catch {
          /* ignore */
        }
        socketRef.current = null;
      }
    };
  }, [homeId]);

  const fetchWeek = useCallback(
    async function fetchWeek() {
      if (!homeId) return;
      setLoading(true);
      try {
        const weekUrl = getDashboardWeek(homeId);

        const res = await api.get(weekUrl);

        if (res?.data?.data) setWeek(res.data.data);
      } catch (err) {
        setWeek(null);
        setError(
          err?.response?.data?.message ||
            err.message ||
            "Failed to load week data"
        );
      } finally {
        setLoading(false);
      }
    },
    [homeId]
  );

  const fetchMonth = useCallback(
    async function fetchMonth() {
      if (!homeId) return;
      setLoading(true);
      try {
        const monthUrl = getDashboardMonth(homeId);

        const res = await api.get(monthUrl);

        if (res?.data?.data) setMonth(res.data.data);
      } catch (err) {
        setMonth(null);
        setError(
          err?.response?.data?.message ||
            err.message ||
            "Failed to load month data"
        );
      } finally {
        setLoading(false);
      }
    },
    [homeId]
  );

  const fetchComparison = useCallback(
    async function fetchComparison(days = 7) {
      if (!homeId) return;
      setLoading(true);
      try {
        const compUrl = getDashboardComparison(homeId, days);

        const res = await api.get(compUrl);

        if (res?.data?.data) setComparison(res.data.data);
      } catch (err) {
        setComparison(null);
        setError(
          err?.response?.data?.message ||
            err.message ||
            "Failed to load comparison data"
        );
      } finally {
        setLoading(false);
      }
    },
    [homeId]
  );

  return {
    loading,
    today,
    week,
    month,
    comparison,
    error,
    fetchWeek,
    fetchMonth,
    fetchComparison,
  };
}
