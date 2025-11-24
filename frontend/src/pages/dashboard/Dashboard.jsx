import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useAppStore from "../../stores/useAppStore";
import useDashboardData from "../../hooks/useDashboardData";
import useInsights from "../../hooks/useInsights";
import TotalCard from "../../components/Dashboard/TotalCard";
import HourlyLineChart from "../../components/Dashboard/HourlyLineChart";
import AppliancePieChart from "../../components/Dashboard/AppliancePieChart";
import WeeklyBarChart from "../../components/Dashboard/WeeklyBarChart";
import MonthlyBarChart from "../../components/Dashboard/MonthlyBarChart";
import WeekdayWeekendChart from "../../components/Dashboard/WeekdayWeekendChart";
import WeeksBarChart from "../../components/Dashboard/WeeksBarChart";
import TopContributor from "../../components/Dashboard/TopContributor";
import ComparisonStat from "../../components/Dashboard/ComparisonStat";
import {
  FiTrendingUp,
  FiActivity,
  FiBarChart2,
  FiCalendar,
  FiPieChart,
  FiClock,
  FiExternalLink,
} from "react-icons/fi";
import { Lightbulb, TrendingUp, AlertCircle, TrendingDown } from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const home = useAppStore((s) => s.home);
  const homeLoading = useAppStore((s) => s.homeLoading);

  const resolveHomeId = (h) => {
    if (!h) return null;
    return h.data?.home?.homeCode || h.data?.home?._id || null;
  };
  const homeIdCandidate = resolveHomeId(home);

  const {
    loading: _loading,
    today,
    week,
    month: _month,
    comparison,
    error,
    fetchWeek,
    fetchMonth,
    fetchComparison,
  } = useDashboardData(homeIdCandidate);

  const { insights, insightsLoading } = useInsights();

  useEffect(() => {
    if (homeIdCandidate) {
      fetchWeek();
      fetchMonth();
      fetchComparison(7);
    }
  }, [homeIdCandidate, fetchWeek, fetchMonth, fetchComparison]);

  const containerRef = useRef(null);

  useEffect(() => {
    const root = containerRef.current || document;
    const sections = Array.from(
      (root || document).querySelectorAll('[data-section="dashboard"]')
    );
    if (!sections.length) return;

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.4) {
            const el = entry.target;
            const section = el.getAttribute("data-section");
            const sub = el.getAttribute("data-sub");
            window.dispatchEvent(
              new CustomEvent("active-sub", { detail: { section, sub } })
            );
          }
        });
      },
      {
        root: null,
        rootMargin: "-20% 0px -40% 0px",
        threshold: [0.25, 0.4, 0.6],
      }
    );

    sections.forEach((s) => obs.observe(s));

    const scrollToHandler = (e) => {
      const { section, sub } = e.detail || {};
      if (!section || !sub) return;
      const target = document.querySelector(
        `[data-section="${section}"][data-sub="${sub}"]`
      );
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    window.addEventListener("scroll-to", scrollToHandler);

    return () => {
      obs.disconnect();
      window.removeEventListener("scroll-to", scrollToHandler);
    };
  }, []);

  if (homeLoading)
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-sec-600 font-inter">Loading home data...</div>
      </div>
    );

  if (!home)
    return <div className="p-6 text-sec-600 font-inter">No home selected</div>;

  if (error) {
    return (
      <div className="p-6">
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 font-inter">
          Dashboard error: {String(error)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6" ref={containerRef}>
      {/* Section 1: Overview - 3 columns */}
      <section
        data-section="dashboard"
        data-sub="sub-1"
        id="dashboard-sub-1"
        className="grid grid-cols-1 lg:grid-cols-3 gap-4 w-full"
        aria-label="Dashboard Overview"
      >
        <TotalCard summary={today?.summary} />
        <TopContributor
          applianceTotals={today?.applianceTotals || {}}
          topAppliance={today?.summary?.topAppliance}
          totalEmissions={today?.summary?.totalEmissions}
          hourly={today?.totalHourly}
        />
        <ComparisonStat comparison={comparison} />
      </section>

      {/* Section 2: Hourly & Appliance - 2 columns (bigger + smaller) */}
      <section
        data-section="dashboard"
        data-sub="sub-2"
        id="dashboard-sub-2"
        className="grid grid-cols-1 xl:grid-cols-7 gap-4"
        aria-label="Real-time Analytics"
      >
        {/* Hourly Chart - Takes 4/7 width */}
        <div className="xl:col-span-4  ">
          <HourlyLineChart hourly={today ? today.totalHourly : null} />
        </div>

        {/* Appliance Pie Chart - Takes 3/7 width */}
        <div className="xl:col-span-3 bg-neu-0 rounded-2xl">
          <AppliancePieChart applianceTotals={today?.applianceTotals || {}} />
        </div>
      </section>

      {/* Section 3: Weekly & Monthly - 2 columns (bigger + smaller) */}
      <section
        data-section="dashboard"
        data-sub="sub-3"
        id="dashboard-sub-3"
        className="grid grid-cols-1 xl:grid-cols-3 gap-4"
        aria-label="Historical Trends"
      >
        {/* Weekly Chart - Takes 1/3 width */}
        <div className="xl:col-span-1 bg-neu-0 rounded-2xl border border-prim-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-prim-100 rounded-xl flex items-center justify-center border border-prim-200">
              <FiTrendingUp className="w-5 h-5 text-prim-600" />
            </div>
            <div>
              <h3 className="font-inter font-medium text-sec-800 text-lg">
                Weekly Trend Analysis
              </h3>
              <p className="text-sm text-sec-600 font-inter">
                7-day emission patterns and insights
              </p>
            </div>
          </div>
          {week ? (
            <WeeklyBarChart week={week} />
          ) : (
            <div className="h-64 flex items-center justify-center text-sec-500 font-inter text-sm">
              Not enough historical data for weekly view
            </div>
          )}
        </div>

        {/* Monthly Chart - Takes 2/3 width */}
        <div className="xl:col-span-2 bg-neu-0 rounded-2xl border border-prim-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-sec-100 rounded-xl flex items-center justify-center border border-sec-200">
              <FiCalendar className="w-5 h-5 text-sec-600" />
            </div>
            <div>
              <h3 className="font-inter font-medium text-sec-800 text-lg">
                Monthly Overview
              </h3>
              <p className="text-sm text-sec-600 font-inter">
                30-day emission summary
              </p>
            </div>
          </div>
          {_month ? (
            <MonthlyBarChart month={_month} />
          ) : (
            <div className="h-64 flex items-center justify-center text-sec-500 font-inter text-sm">
              Not enough monthly data available
            </div>
          )}
        </div>
      </section>

      {/* Section 4: Weekday vs Weekend & Weeks - 2 equal columns */}
      <section
        data-section="dashboard"
        data-sub="sub-4"
        id="dashboard-sub-4"
        className="grid grid-cols-1 lg:grid-cols-2 gap-4"
        aria-label="Comparative Analysis"
      >
        {/* Weekday vs Weekend */}
        <div className="bg-neu-0 rounded-2xl border border-prim-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-prim-100 rounded-xl flex items-center justify-center border border-prim-200">
              <FiClock className="w-5 h-5 text-prim-600" />
            </div>
            <div>
              <h3 className="font-inter font-medium text-sec-800 text-lg">
                Weekday vs Weekend
              </h3>
              <p className="text-sm text-sec-600 font-inter">
                Average emission comparison
              </p>
            </div>
          </div>
          <WeekdayWeekendChart month={_month} />
        </div>

        {/* Weeks Bar Chart */}
        <div className="bg-neu-0 rounded-2xl border border-prim-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-sec-100 rounded-xl flex items-center justify-center border border-sec-200">
              <FiBarChart2 className="w-5 h-5 text-sec-600" />
            </div>
            <div>
              <h3 className="font-inter font-medium text-sec-800 text-lg">
                Weekly Aggregation
              </h3>
              <p className="text-sm text-sec-600 font-inter">
                Monthly data grouped by weeks
              </p>
            </div>
          </div>
          <WeeksBarChart month={_month} />
        </div>
      </section>

      {/* Section 5: Top Insights */}
      <section
        className="bg-neu-0 rounded-2xl border border-prim-200 p-6"
        aria-label="AI Insights Preview"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-sec-100 rounded-xl flex items-center justify-center border border-sec-200">
              <Lightbulb className="w-5 h-5 text-sec-600" />
            </div>
            <div>
              <h3 className="font-inter font-medium text-sec-800 text-lg">
                AI-Powered Insights
              </h3>
              <p className="text-sm text-sec-600 font-inter">
                Smart recommendations to reduce your carbon footprint
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate("/insights")}
            className="inline-flex -mt-6 items-center gap-2 px-2 py-2 bg-transparent text-neu-400 rounded-lg hover:text-sec-600 hover:cursor-pointer transition-colors text-sm font-medium"
          >
            <FiExternalLink className="w-6 h-6" />
          </button>
        </div>

        {insightsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse"
              >
                <div className="h-5 w-20 bg-gray-200 rounded mb-3"></div>
                <div className="h-4 w-full bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
              </div>
            ))}
          </div>
        ) : insights && insights.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {insights.slice(0, 3).map((insight) => {
              const IMPACT_LEVELS = {
                high: {
                  color: "bg-red-50 border-red-300 text-red-700",
                  icon: AlertCircle,
                  label: "High Impact",
                },
                medium: {
                  color: "bg-amber-50 border-amber-300 text-amber-700",
                  icon: TrendingUp,
                  label: "Medium Impact",
                },
                low: {
                  color: "bg-green-50 border-green-300 text-green-700",
                  icon: TrendingDown,
                  label: "Low Impact",
                },
              };
              const impactConfig =
                IMPACT_LEVELS[insight.impactLevel] || IMPACT_LEVELS.low;
              const IconComponent = impactConfig.icon;

              return (
                <div
                  key={insight._id}
                  className="bg-white rounded-xl border border-gray-200 p-4 hover:border-sec-300 transition-colors cursor-pointer"
                  onClick={() => navigate("/insights")}
                >
                  <div
                    className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md font-semibold text-xs border mb-3 ${impactConfig.color}`}
                  >
                    <IconComponent className="w-3.5 h-3.5" />
                    {impactConfig.label}
                  </div>
                  <h4 className="font-semibold text-prim-900 mb-2 text-sm line-clamp-2">
                    {insight.title}
                  </h4>
                  <p className="text-neu-600/90 text-xs line-clamp-2">
                    {insight.description}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Lightbulb className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-gray-600 text-sm">
              No insights available yet. Check back soon!
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
