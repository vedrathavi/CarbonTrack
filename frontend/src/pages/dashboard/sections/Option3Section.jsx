import React, { useRef, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useInsights from "../../../hooks/useInsights";
import useAppStore from "../../../stores/useAppStore";
import {
  RefreshCw,
  Lightbulb,
  Filter,
  X,
  AirVent,
  TrendingUp,
  AlertCircle,
  Info,
  Zap,
  Home,
  Thermometer,
  Droplets,
  Wind,
  Sun,
  Clock,
  Battery,
  Sprout,
  Recycle,
  Leaf,
  TreePine,
  Cloud,
  Shield,
  DollarSign,
  TrendingDown,
  Power,
  Eye,
  Brain,
  Snowflake,
  Cpu,
  Scale,
  Fan,
  Wrench,
  Moon,
  Sofa,
  Smartphone,
  SunIcon,
  Gauge,
  CookingPot,
  Refrigerator,
  Flame,
  Lightbulb as LightbulbIcon,
  HelpCircle,
  Ghost,
  ArrowUpCircle,
  Wind as WindIcon,
} from "lucide-react";

// Constants outside component to avoid recreation
const TAG_ICONS = {
  // Original tags
  suggestion: Lightbulb,
  appliance: Home,
  heating: Thermometer,
  maintenance: Shield,
  water: Droplets,
  energy: Battery,
  solar: Sun,
  timing: Clock,
  sustainability: Sprout,
  recycling: Recycle,
  garden: Leaf,
  outdoor: TreePine,
  weather: Cloud,

  // New tags from image
  "always-on": Power,
  awareness: Eye,
  behavior: Brain,
  carbon: Wind,
  cooling: Snowflake,
  electronics: Cpu,
  equivalence: Scale,
  fan: Fan,
  filter: Filter,
  fun: Zap,
  kitchen: CookingPot,
  night: Moon,
  passive: Sofa,
  "smart home": Smartphone,
  summer: SunIcon,
  technology: Cpu,
  thermostat: Gauge,
  
  // Additional tags from image
  AC: AirVent,
  LEDs: LightbulbIcon,
  appliances: Home,
  drafts: WindIcon,
  fridge: Refrigerator,
  "hot water": Flame,
  insulation: Shield,
  lighting: LightbulbIcon,
  myth: HelpCircle,
  "phantom load": Ghost,
  upgrade: ArrowUpCircle,
  ventilation: Fan,
  "water heater": Flame,
  windows: Wind,
  
  default: Info,
};

const TAG_COLORS = {
  // Original tags
  suggestion: "bg-sec-50/50 border-sec-200 text-sec-700",
  appliance: "bg-sec-50/50 border-sec-200 text-sec-700",
  heating: "bg-orange-50/50 border-orange-200 text-orange-700",
  fun: "bg-pink-50/50 border-pink-200 text-pink-700",
  water: "bg-cyan-50/50 border-cyan-200 text-cyan-700",
  energy: "bg-amber-50/50 border-amber-200 text-amber-700",
  solar: "bg-yellow-50/50 border-yellow-200 text-yellow-700",
  timing: "bg-purple-50/50 border-purple-200 text-purple-700",
  sustainability: "bg-emerald-50/50 border-emerald-200 text-emerald-700",
  recycling: "bg-lime-50/50 border-lime-200 text-lime-700",
  garden: "bg-green-50/50 border-green-200 text-green-700",
  outdoor: "bg-teal-50/50 border-teal-200 text-teal-700",
  weather: "bg-sky-50/50 border-sky-200 text-sky-700",

  // New tags from image
  "always-on": "bg-amber-50/50 border-amber-200 text-amber-700",
  awareness: "bg-blue-50/50 border-blue-200 text-blue-700",
  behavior: "bg-purple-50/50 border-purple-200 text-purple-700",
  carbon: "bg-gray-50/50 border-gray-200 text-gray-700",
  cooling: "bg-cyan-50/50 border-cyan-200 text-cyan-700",
  electronics: "bg-indigo-50/50 border-indigo-200 text-indigo-700",
  equivalence: "bg-orange-50/50 border-orange-200 text-orange-700",
  fan: "bg-blue-50/50 border-blue-200 text-blue-700",
  filter: "bg-amber-50/50 border-amber-200 text-amber-700",
  footprint: "bg-green-50/50 border-green-200 text-green-700",
  kitchen: "bg-red-50/50 border-red-200 text-red-700",
  maintenance: "bg-yellow-50/50 border-yellow-200 text-yellow-700",
  night: "bg-indigo-50/50 border-indigo-200 text-indigo-700",
  passive: "bg-teal-50/50 border-teal-200 text-teal-700",
  "smart home": "bg-purple-50/50 border-purple-200 text-purple-700",
  summer: "bg-orange-50/50 border-orange-200 text-orange-700",
  technology: "bg-blue-50/50 border-blue-200 text-blue-700",
  thermostat: "bg-red-50/50 border-red-200 text-red-700",
  windows: "bg-cyan-50/50 border-cyan-200 text-cyan-700",
  
  // Additional tags from image
  AC: "bg-cyan-50/50 border-cyan-200 text-cyan-700",
  LEDs: "bg-yellow-50/50 border-yellow-200 text-yellow-700",
  appliances: "bg-sec-50/50 border-sec-200 text-sec-700",
  drafts: "bg-slate-50/50 border-slate-200 text-slate-700",
  fridge: "bg-blue-50/50 border-blue-200 text-blue-700",
  "hot water": "bg-red-50/50 border-red-200 text-red-700",
  insulation: "bg-gray-50/50 border-gray-200 text-gray-700",
  lighting: "bg-yellow-50/50 border-yellow-200 text-yellow-700",
  myth: "bg-slate-50/50 border-slate-200 text-slate-700",
  "phantom load": "bg-violet-50/50 border-violet-200 text-violet-700",
  upgrade: "bg-green-50/50 border-green-200 text-green-700",
  ventilation: "bg-sky-50/50 border-sky-200 text-sky-700",
  "water heater": "bg-orange-50/50 border-orange-200 text-orange-700",
  
  default: "bg-gray-50/50 border-gray-200 text-gray-700",
};

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

// Memoized components
const Tag = React.memo(({ t, onFilter, isActive }) => {
  const IconComponent = TAG_ICONS[t] || TAG_ICONS.default;
  const colors = TAG_COLORS[t] || TAG_COLORS.default;

  return (
    <button
      onClick={() => onFilter(t)}
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-all duration-200 ${
        isActive
          ? "bg-sec-600 text-white border-sec-600 shadow-sm"
          : `${colors} hover:border-sec-300 hover:shadow-sm`
      }`}
    >
      <IconComponent className="w-3.5 h-3.5" />
      {t}
    </button>
  );
});

Tag.displayName = "Tag";

const InsightCard = React.memo(({ ins }) => {
  const impactConfig = IMPACT_LEVELS[ins.impactLevel] || IMPACT_LEVELS.low;
  const IconComponent = impactConfig.icon;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      className="group bg-white rounded-xl border border-gray-200 p-6 transition-all duration-200 hover:border-sec-300 "
    >
      <div className="flex items-center justify-between mb-4">
        <div
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg font-semibold text-sm border ${impactConfig.color}`}
        >
          <IconComponent className="w-4 h-4" />
          {impactConfig.label}
        </div>
        {ins.estimatedSavings && (
          <div className="flex items-center gap-1 text-green-600 font-semibold text-sm">
            <DollarSign className="w-4 h-4" />
            <span>{ins.estimatedSavings} kWh</span>
          </div>
        )}
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-3 group-hover:text-sec-600 transition-colors">
        {ins.title}
      </h3>
      <p className="text-gray-600 leading-relaxed mb-4 text-sm">
        {ins.description}
      </p>

      <div className="flex flex-wrap gap-1.5">
        {(ins.tags || []).slice(0, 4).map((t) => {
          const TagIcon = TAG_ICONS[t] || TAG_ICONS.default;
          const tagColors = TAG_COLORS[t] || TAG_COLORS.default;
          return (
            <span
              key={t}
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border ${tagColors}`}
            >
              <TagIcon className="w-3 h-3" />
              {t}
            </span>
          );
        })}
        {(ins.tags || []).length > 4 && (
          <span className="px-2 py-1 rounded-md text-xs font-medium bg-gray-50 text-gray-600 border border-gray-200">
            +{ins.tags.length - 4}
          </span>
        )}
      </div>
    </motion.article>
  );
});

InsightCard.displayName = "InsightCard";

export default function InsightsSection() {
  const containerRef = useRef(null);
  const { insights, insightsLoading, insightsError, refresh } = useInsights();
  const home = useAppStore((s) => s.home);
  const resolvedHome =
    home?.data?.home?._id || home?.data?.homeId || home?._id || null;

  const [activeFilters, setActiveFilters] = useState({
    tags: [],
    impactLevel: null,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showAllTags, setShowAllTags] = useState(false);

  const allTags = useMemo(() => {
    if (!insights) return [];
    const tagSet = new Set();
    insights.forEach((ins) => {
      ins.tags?.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [insights]);

  const filteredInsights = useMemo(() => {
    if (!insights) return [];

    let filtered = [...insights];

    // AND logic for tags - must include all selected tags
    if (activeFilters.tags.length > 0) {
      filtered = filtered.filter((ins) =>
        activeFilters.tags.every((tag) => ins.tags?.includes(tag))
      );
    }

    // Filter by impact level
    if (activeFilters.impactLevel) {
      filtered = filtered.filter(
        (ins) =>
          ins.impactLevel?.toLowerCase() ===
          activeFilters.impactLevel?.toLowerCase()
      );
    }

    // Sort by impact level
    return filtered.sort((a, b) => {
      const priority = { high: 0, medium: 1, low: 2 };
      const aLevel = a.impactLevel?.toLowerCase();
      const bLevel = b.impactLevel?.toLowerCase();
      return (priority[aLevel] ?? 2) - (priority[bLevel] ?? 2);
    });
  }, [insights, activeFilters]);

  const hasActiveFilters =
    activeFilters.tags.length > 0 || activeFilters.impactLevel !== null;

  const displayedTags = showAllTags ? allTags : allTags.slice(0, 8);

  // Event handlers
  const handleTagFilter = (tag) => {
    setActiveFilters((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const handleImpactFilter = (level) => {
    setActiveFilters((prev) => ({
      ...prev,
      impactLevel: prev.impactLevel === level ? null : level,
    }));
  };

  const clearAllFilters = () => {
    setActiveFilters({ tags: [], impactLevel: null });
  };

  return (
    <div ref={containerRef} className="space-y-6 p-6  min-h-screen">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white border border-gray-200 rounded-xl shadow-sm">
            <Lightbulb className="w-7 h-7 text-sec-600" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Energy Insights
            </h1>
            <p className="text-gray-600 mt-1 text-sm">
              Smart recommendations to optimize your consumption
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="btn-3d-wrapper">
            <div className="btn-3d-offset !bg-sec-700" aria-hidden />
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex btn-3d btn-3d--primary  items-center gap-2 px-4 py-2.5 !bg-white border !border-sec-700 rounded-lg !text-sec-700 transition-colors text-sm font-medium"
            >
              <Filter className="w-4 h-4" />
              Filters
              {hasActiveFilters && (
                <span className="bg-sec-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {activeFilters.tags.length +
                    (activeFilters.impactLevel ? 1 : 0)}
                </span>
              )}
            </button>
          </div>
          <div className="btn-3d-wrapper">
            <div className="btn-3d-offset !bg-sec-700" aria-hidden />
            <button
              onClick={() => refresh(resolvedHome)}
              disabled={insightsLoading}
              className="inline-flex items-center btn-3d btn-3d--primary gap-2 px-4 py-2.5 !bg-sec-500 !text-neu-0 rounded-lg hover:bg-sec-600 disabled:opacity-50 transition-transform transform-gpu shadow-md active:translate-y-1 active:shadow-inner text-sm font-medium"
            >
              <RefreshCw
                className={`w-4 h-4 ${insightsLoading ? "animate-spin" : ""}`}
              />
              {insightsLoading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>
      </header>

      {/* Filter Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-xl border border-gray-200 p-6 overflow-hidden"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Filter Insights
              </h3>
              <div className="flex items-center gap-3">
                {hasActiveFilters && (
                  <button
                    onClick={clearAllFilters}
                    className="text-sec-600 hover:text-sec-700 font-medium flex items-center gap-1 text-sm"
                  >
                    <X className="w-4 h-4" />
                    Clear all
                  </button>
                )}
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Impact Level Filter */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 uppercase tracking-wide mb-3">
                Impact Level
              </h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(IMPACT_LEVELS).map(([key, config]) => {
                  const IconComponent = config.icon;
                  return (
                    <button
                      key={key}
                      onClick={() => handleImpactFilter(key)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium border transition-colors text-sm ${
                        activeFilters.impactLevel === key
                          ? "bg-sec-600 text-white border-sec-600"
                          : "bg-white border-gray-300 hover:border-sec-400"
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                      {config.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tags Filter */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-700 uppercase tracking-wide">
                  Categories
                </h4>
                {allTags.length > 8 && (
                  <button
                    onClick={() => setShowAllTags(!showAllTags)}
                    className="text-sec-600 hover:text-sec-700 text-sm"
                  >
                    {showAllTags ? "Show less" : `Show all (${allTags.length})`}
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {displayedTags.map((tag) => (
                  <Tag
                    key={tag}
                    t={tag}
                    isActive={activeFilters.tags.includes(tag)}
                    onFilter={handleTagFilter}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading State */}
      {insightsLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse"
            >
              <div className="h-5 w-28 bg-gray-200 rounded mb-4"></div>
              <div className="h-5 w-full bg-gray-200 rounded mb-3"></div>
              <div className="space-y-2 mb-4">
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                <div className="h-3 bg-gray-200 rounded w-4/6"></div>
              </div>
              <div className="flex gap-1.5">
                <div className="h-6 w-14 bg-gray-200 rounded"></div>
                <div className="h-6 w-16 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {/* {insightsError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            Unable to load insights
          </h3>
          <p className="text-red-700 text-sm">{insightsError}</p>
        </div>
      )} */}

      {/* Empty State */}
      {!insightsLoading && filteredInsights.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-white border border-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Lightbulb className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {hasActiveFilters
              ? "No matching insights"
              : insights && insights.length === 0
              ? "No insights available"
              : "No insights found"}
          </h2>
          <p className="text-gray-600 max-w-md mx-auto mb-6 text-sm">
            {hasActiveFilters
              ? "Try adjusting your filters to see more recommendations."
              : "Continue using Carbon Track to generate personalized energy insights."}
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="px-5 py-2.5 bg-sec-600 text-white rounded-lg hover:bg-sec-700 font-medium text-sm"
            >
              Clear All Filters
            </button>
          )}
        </div>
      )}

      {/* Insights Grid */}
      {!insightsLoading && filteredInsights.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-gray-600 text-sm">
              Showing{" "}
              <span className="font-semibold text-gray-900">
                {filteredInsights.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-gray-900">
                {insights?.length || 0}
              </span>{" "}
              insights
              {activeFilters.tags.length > 0 && (
                <span className="text-gray-500 ml-2">
                  • {activeFilters.tags.length} categor
                  {activeFilters.tags.length === 1 ? "y" : "ies"} selected
                </span>
              )}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-sec-600 hover:text-sec-700 font-medium flex items-center gap-1 text-sm"
              >
                <X className="w-4 h-4" />
                Clear filters
              </button>
            )}
          </div>

          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
          >
            <AnimatePresence>
              {filteredInsights.map((ins) => (
                <InsightCard key={ins._id} ins={ins} />
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </div>
  );
}