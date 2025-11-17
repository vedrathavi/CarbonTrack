import React, {  useEffect } from "react";
import useAppStore from "../../stores/useAppStore";
import useDashboardData from "../../hooks/useDashboardData";
import TotalCard from "../../components/Dashboard/TotalCard";
import HourlyLineChart from "../../components/Dashboard/HourlyLineChart";
import AppliancePieChart from "../../components/Dashboard/AppliancePieChart";
import WeeklyBarChart from "../../components/Dashboard/WeeklyBarChart";
import ComparisonStat from "../../components/Dashboard/ComparisonStat";

export default function Dashboard() {
  const home = useAppStore((s) => s.home);
  const homeLoading = useAppStore((s) => s.homeLoading);
  const resolveHomeId = (h) => {
    if (!h) return null;
    return (
      h.data?.home?.homeCode ||
      h.data?.home?._id ||
      null
    );
  };
  const homeIdCandidate = resolveHomeId(home);
 
  const { loading: _loading, today, week, month: _month, comparison, error, fetchWeek, fetchMonth, fetchComparison } = useDashboardData(homeIdCandidate);

  useEffect(() => {
    if (homeIdCandidate) {
      fetchWeek();
      fetchMonth();
      fetchComparison(7);
    }
  }, [homeIdCandidate, fetchWeek, fetchMonth, fetchComparison]);
  if (homeLoading) return <div>Loading home...</div>;
  if (!home) return <div className="p-6">No home selected</div>;

  if (error) {
    return <div className="p-6">
      <div className="mb-4 p-3 bg-red-100 text-red-800 rounded">Dashboard error: {String(error)}</div>
    </div>;
  }

    console.log("Dashboard render:", { today, week, comparison });
    
  return (
    <div className="space-y-6 p-6">
      <div className="grid grid-cols-3 gap-4 w-full">
        <TotalCard summary={today?.summary} />
        {comparison ? (
          <ComparisonStat comparison={comparison} />
        ) : (
          <div className="p-4 bg-white rounded shadow">Not enough historical data for comparison</div>
        )}
       
      </div>

      <div className="grid grid-cols-3 gap-4">
        <HourlyLineChart hourly={today ? today.totalHourly : null} />
        <AppliancePieChart applianceTotals={today?.applianceTotals || {}} />
        {week  ? (
          <WeeklyBarChart week={week} />
        ) : (
          <div className="p-4 bg-white rounded shadow">Not enough historical data for weekly view</div>
        )}
      </div>
    </div>
  );
}
