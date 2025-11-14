import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaGlobeAmericas,
  FaChartLine,
  FaLightbulb,
  FaHome,
  FaCar,
  FaPlug,
  FaUtensils,
  FaCloud,
  FaTemperatureHigh,
  FaUmbrella,
  FaBalanceScale,
  FaLeaf,
  FaUsers,
  FaArrowRight,
  FaDatabase,
  FaSolarPanel,
  FaSeedling,
} from "react-icons/fa";
import {
  GiWorld,
  GiFactory,
  GiTreeGrowth,
  GiEarthAmerica,
} from "react-icons/gi";

const SECTIONS = [
  {
    id: "sub-hero",
    title: "Understand Your Carbon Footprint",
    icon: FaGlobeAmericas,
  },
  { id: "sub-what", title: "What is Carbon Footprint", icon: FaChartLine },
  { id: "sub-why", title: "Why It Matters", icon: FaLightbulb },
  { id: "sub-sources", title: "Emission Sources", icon: FaDatabase },
  { id: "sub-how", title: "How CarbonTrack Helps", icon: FaLeaf },
  { id: "sub-reduce", title: "Reduction Strategies", icon: FaLeaf },
  { id: "sub-global", title: "Global Perspective", icon: GiWorld },
  { id: "sub-cta", title: "Start Your Journey", icon: GiEarthAmerica },
];

// Validated data from authoritative sources
const GLOBAL_DATA = {
  perCapitaEmissions: [
    { country: "Qatar", emissions: "35.6t", source: "World Bank 2022" },
    {
      country: "United States",
      emissions: "14.9t",
      source: "Global Carbon Project 2023",
    },
    {
      country: "Australia",
      emissions: "14.8t",
      source: "Global Carbon Project 2023",
    },
    {
      country: "Canada",
      emissions: "14.2t",
      source: "Global Carbon Project 2023",
    },
    {
      country: "Germany",
      emissions: "8.6t",
      source: "Global Carbon Project 2023",
    },
    {
      country: "China",
      emissions: "8.0t",
      source: "Global Carbon Project 2023",
    },
    {
      country: "United Kingdom",
      emissions: "5.2t",
      source: "Global Carbon Project 2023",
    },
    {
      country: "France",
      emissions: "4.6t",
      source: "Global Carbon Project 2023",
    },
    {
      country: "Brazil",
      emissions: "2.3t",
      source: "Global Carbon Project 2023",
    },
    {
      country: "India",
      emissions: "1.9t",
      source: "Global Carbon Project 2023",
    },
    {
      country: "Global Average",
      emissions: "4.7t",
      source: "Global Carbon Project 2023",
    },
    {
      country: "Paris Agreement Target",
      emissions: "2.0t",
      source: "IPCC 2030 Goal",
    },
  ],
  sectorContributions: [
    { sector: "Energy Production", percentage: 35, source: "IEA 2023" },
    { sector: "Transportation", percentage: 23, source: "IEA 2023" },
    { sector: "Industry", percentage: 19, source: "IEA 2023" },
    { sector: "Agriculture", percentage: 12, source: "FAO 2023" },
    { sector: "Buildings", percentage: 8, source: "UNEP 2023" },
    { sector: "Other", percentage: 3, source: "IEA 2023" },
  ],
  digitalFootprint: [
    {
      activity: "1 hour of HD video streaming",
      co2: "0.056 kg",
      source: "The Shift Project 2021",
    },
    {
      activity: "100 emails (with attachments)",
      co2: "0.026 kg",
      source: "Carbon Literacy Project",
    },
    {
      activity: "Cloud storage (10GB/year)",
      co2: "0.2 kg",
      source: "IEEE 2022",
    },
    {
      activity: "Video conference (1h HD)",
      co2: "0.15 kg",
      source: "Purdue University 2021",
    },
  ],
  climateImpacts: [
    {
      icon: FaTemperatureHigh,
      title: "Temperature Rise",
      desc: "Global surface temperature has risen 1.1°C above pre-industrial levels (2011-2020)",
      source: "IPCC AR6 2023",
      urgency: "High",
    },
    {
      icon: FaUmbrella,
      title: "Extreme Weather",
      desc: "Frequency of extreme weather events has increased 5x over 50 years",
      source: "WMO 2021",
      urgency: "High",
    },
    {
      icon: GiTreeGrowth,
      title: "Biodiversity Loss",
      desc: "1 million species face extinction due to climate change impacts",
      source: "IPBES 2019",
      urgency: "Critical",
    },
    {
      icon: FaBalanceScale,
      title: "Economic Impact",
      desc: "Climate change could cost global economy $23 trillion by 2050",
      source: "Swiss Re 2021",
      urgency: "High",
    },
  ],
};

export default function EducationSection() {
  const containerRef = useRef();
  const navigate = useNavigate();
  const [animateSectorBars, setAnimateSectorBars] = useState(false);
  const [animatePerCapitaBars, setAnimatePerCapitaBars] = useState(false);
  const [animateBreakdown, setAnimateBreakdown] = useState(false);

  // helpers for per-capita visuals
  const parseEmissions = (val) => {
    if (!val && val !== 0) return 0;
    const n = parseFloat(String(val).replace(/[^0-9.]/g, ""));
    return Number.isFinite(n) ? n : 0;
  };

  const maxEmission = Math.max(
    ...GLOBAL_DATA.perCapitaEmissions.map((c) => parseEmissions(c.emissions)),
    0
  );
  useEffect(() => {
    const onScrollTo = (e) => {
      const { sub } = e.detail || {};
      if (!sub) return;
      const el = document.getElementById(sub);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    window.addEventListener("scroll-to", onScrollTo);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const el = entry.target;
          if (entry.isIntersecting) {
            el.classList.remove("opacity-0", "translate-y-8");
            el.classList.add(
              "opacity-100",
              "translate-y-0",
              "transition",
              "duration-1000",
              "ease-out"
            );
            const id = el.id;
            if (id) {
              window.dispatchEvent(
                new CustomEvent("active-sub", {
                  detail: { section: "education", sub: id },
                })
              );
              if (id === "sub-sources") {
                setAnimateSectorBars(true);
              }
              if (id === "sub-hero") {
                setAnimateBreakdown(true);
              }
              if (id === "sub-global") {
                setAnimatePerCapitaBars(true);
              }
            }
          }
        });
      },
      { root: null, threshold: 0.35, rootMargin: "0px 0px -20% 0px" }
    );

    const subs = Array.from(document.querySelectorAll("#education [id^=sub-]"));
    subs.forEach((s) => {
      s.classList.add("opacity-0", "translate-y-8", "will-change-transform");
      observer.observe(s);
    });

    return () => {
      window.removeEventListener("scroll-to", onScrollTo);
      observer.disconnect();
    };
  }, []);

  return (
    <div
      id="education"
      ref={containerRef}
      className="w-full flex gap-6 max-w-6xl mx-auto   "
    >
      {/* Enhanced Content */}
      <div className="flex-1 space-y-12">
        {/* Hero Section */}
        <section id="sub-hero" className="relative py-10 sm:py-12 lg:py-16">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-instru font-normal text-sec-900 mb-6 leading-tight">
                Understanding Your
                <span className="block text-sec-600">Carbon Footprint</span>
              </h1>

              <p className="text-lg text-sec-700 mb-8 leading-relaxed">
                Your carbon footprint represents the total greenhouse gas
                emissions caused directly and indirectly by your activities.
                Measured in carbon dioxide equivalents (CO₂e), it's a crucial
                metric for understanding your environmental impact and taking
                meaningful climate action.
              </p>

              <div className="flex flex-wrap gap-4">
                <div className="btn-3d-wrapper">
                  <div className="btn-3d-offset " aria-hidden />
                  <button
                    onClick={() =>
                      window.dispatchEvent(
                        new CustomEvent("scroll-to", {
                          detail: { sub: "sub-how" },
                        })
                      )
                    }
                    className="!bg-sec-600 btn-3d btn-3d--primary "
                  >
                    <span className="flex items-center gap-2 text-md text-prim-100 font-inter font-medium">
                      Learn How to Reduce
                      <FaArrowRight className="w-4 h-4" />
                    </span>
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-2xl p-6 sm:p-8 border border-sec-200 group transition-all duration-300 hover:-translate-y-1">
              <h3 className="font-inter font-medium text-sec-800 mb-6 text-lg sm:text-xl">
                Average Carbon Footprint Breakdown
                <span className="block text-sm text-sec-600 font-normal mt-1">
                  (Typical Developed Country)
                </span>
              </h3>
              <div className="space-y-4">
                {[
                  {
                    category: "Housing & Energy",
                    percentage: 40,
                    color: "bg-sec-600",
                  },
                  {
                    category: "Transportation",
                    percentage: 28,
                    color: "bg-sec-600",
                  },
                  {
                    category: "Food & Diet",
                    percentage: 18,
                    color: "bg-sec-600",
                  },
                  {
                    category: "Goods & Services",
                    percentage: 14,
                    color: "bg-sec-600",
                  },
                ].map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm sm:text-base">
                      <span className="font-inter text-sec-700">
                        {item.category}
                      </span>
                      <span className="font-inter font-medium text-sec-800">
                        {item.percentage}%
                      </span>
                    </div>
                    <div className="w-full bg-sec-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full ${item.color} transition-[width] duration-1000 ease-out`}
                        style={{
                          width: animateBreakdown
                            ? `${item.percentage}%`
                            : "0%",
                          transitionDelay: `${index * 120}ms`,
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-sm text-sec-500 font-inter">
                Source: Our World in Data based on OECD averages
              </div>
            </div>
          </div>
        </section>

        {/* What is Carbon Footprint */}
        <section id="sub-what" className="py-8 sm:py-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-sec-50 rounded-xl flex items-center justify-center border border-sec-200">
              <FaChartLine className="w-6 h-6 text-sec-600" />
            </div>
            <div>
              <h2 className="text-3xl sm:text-4xl font-instru font-normal text-sec-900">
                What is Carbon Footprint
              </h2>
              <p className="text-sec-600 font-inter mt-2">
                Understanding the science behind emissions measurement
              </p>
            </div>
          </div>
          <div className="space-y-6 my-5">
            <p className="text-xl text-sec-700 leading-relaxed">
              A carbon footprint is the total amount of greenhouse gases
              (including carbon dioxide and methane) that are generated by our
              actions. The average carbon footprint for a person in the United
              States is 16 tons, one of the highest rates in the world.
              Globally, the average is closer to 4 tons.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="rounded-2xl p-6 border border-sec-200 group transition-all duration-300 hover:-translate-y-1">
                <h4 className="font-inter font-medium text-sec-800 mb-4 text-lg sm:text-xl">
                  Emission Scopes Framework
                </h4>
                <div className="space-y-4">
                  {[
                    {
                      scope: "Scope 1",
                      type: "Direct Emissions",
                      examples: [
                        "Vehicle fuel combustion",
                        "Natural gas heating",
                        "On-site manufacturing",
                      ],
                      color: "border-red-400",
                    },
                    {
                      scope: "Scope 2",
                      type: "Indirect Energy Emissions",
                      examples: [
                        "Purchased electricity",
                        "Heating/cooling systems",
                        "Steam consumption",
                      ],
                      color: "border-blue-400",
                    },
                    {
                      scope: "Scope 3",
                      type: "Other Indirect Emissions",
                      examples: [
                        "Supply chain emissions",
                        "Employee commuting",
                        "Product lifecycle",
                      ],
                      color: "border-green-400",
                    },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className={`border-l-4 pl-4 py-2 ${item.color} transition-colors duration-300`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-inter  text-sec-700">
                          {item.scope}
                        </span>
                        <span className="text-sm sm:text-base font-semibold text-sec-700">
                          {item.type}
                        </span>
                      </div>
                      <ul className="text-sm sm:text-base text-sec-600 space-y-1">
                        {item.examples.map((example, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-sec-400 rounded-full"></div>
                            {example}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-2xl px-6 py-4 border border-sec-200 group transition-all duration-300 hover:-translate-y-1">
                <h4 className="font-inter font-medium text-sec-800 mb-2 text-xl">
                  Key Emission Sources in Daily Life
                </h4>
                <div className="space-y-2">
                  {[
                    {
                      icon: FaHome,
                      title: "Home Energy",
                      desc: "Heating, cooling, electricity, and appliances account for 40% of household emissions",
                      impact: "2,000 kg CO₂/year average",
                    },
                    {
                      icon: FaCar,
                      title: "Transportation",
                      desc: "Personal vehicles, flights, and public transit contribute significantly to carbon output",
                      impact: "2,800 kg CO₂/year average",
                    },
                    {
                      icon: FaUtensils,
                      title: "Food Consumption",
                      desc: "Food production, especially meat and dairy, has substantial emissions",
                      impact: "1,600 kg CO₂/year average",
                    },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-4 p-3 rounded-lg bg-sec-50 group"
                    >
                      <div className="w-10 h-10 bg-sec-50 rounded-lg flex items-center justify-center border border-sec-200 flex-shrink-0 transition-transform duration-300 group-hover:scale-105">
                        <item.icon className="w-5 h-5 text-sec-600" />
                      </div>
                      <div>
                        <h5 className="font-inter font-medium text-sec-800 mb-1 text-lg">
                          {item.title}
                        </h5>
                        <p className="text-base text-sec-600 mb-2">
                          {item.desc}
                        </p>
                        <div className="text-sm font-inter font-medium text-sec-700 bg-sec-50 px-4 w-fit py-1 rounded-full border border-sec-200">
                          {item.impact}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why It Matters */}
        <section id="sub-why" className="py-8 sm:py-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center border border-amber-200">
              <FaLightbulb className="w-6 h-6 text-sec-600" />
            </div>
            <div>
              <h2 className="text-3xl sm:text-4xl font-instru font-normal text-sec-900">
                Why Carbon Management Matters
              </h2>
              <p className="text-sec-600 font-inter mt-2">
                The scientific consensus on climate impacts
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {GLOBAL_DATA.climateImpacts.map((impact, index) => (
              <div
                key={index}
                className="rounded-2xl p-6 border border-sec-200 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center border ${
                      impact.urgency === "Critical"
                        ? "bg-red-50 border-red-200"
                        : impact.urgency === "High"
                        ? "bg-amber-50 border-amber-200"
                        : "bg-blue-50 border-blue-200"
                    }`}
                  >
                    <impact.icon className={`w-6 h-6 text-sec-600`} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-inter font-medium text-sec-800 mb-3 text-lg sm:text-xl">
                      {impact.title}
                    </h4>
                    <p className="text-sec-600 mb-4 leading-relaxed text-sm sm:text-base">
                      {impact.desc}
                    </p>
                    <div className="flex justify-between items-center">
                      <div className="text-sm font-inter text-sec-500">
                        Source: {impact.source}
                      </div>
                      <div
                        className={`text-xs px-2 py-1 rounded-full ${
                          impact.urgency === "Critical"
                            ? "bg-red-100 text-red-800"
                            : impact.urgency === "High"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {impact.urgency} Priority
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Emission Sources */}
        <section id="sub-sources" className="py-8 sm:py-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center border border-orange-200">
              <FaDatabase className="w-6 h-6 text-sec-600" />
            </div>
            <div>
              <h2 className="text-3xl sm:text-4xl font-instru font-normal text-sec-900">
                Comprehensive Emission Sources
              </h2>
              <p className="text-sec-600 font-inter mt-2">
                Where emissions come from in modern life
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl sm:text-2xl font-inter font-medium text-sec-800 mb-6">
                Digital Carbon Footprint
              </h3>
              <div className="rounded-2xl p-4 sm:p-6 border border-sec-200 group transition-all duration-300 hover:-translate-y-1">
                <p className="text-sm sm:text-base text-sec-700 mb-6">
                  Digital technologies account for approximately 4% of global
                  greenhouse gas emissions, comparable to the aviation industry.
                  This includes data centers, network infrastructure, and device
                  manufacturing.
                </p>
                <div className="space-y-4">
                  {GLOBAL_DATA.digitalFootprint.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center py-3 border-b border-sec-100 last:border-b-0"
                    >
                      <div>
                        <div className="font-inter text-sec-800">
                          {item.activity}
                        </div>
                        <div className="text-sm text-sec-500 font-inter mt-1">
                          {item.source}
                        </div>
                      </div>
                      <span className="font-inter font-medium text-sec-700 bg-orange-50 px-3 py-1 rounded-full text-sm">
                        {item.co2}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl font-inter font-medium text-sec-800 mb-6">
                Global Sector Contributions
              </h3>
              <div className="space-y-6">
                {GLOBAL_DATA.sectorContributions.map((sector, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-sec-50 rounded-xl flex items-center justify-center border border-sec-200 flex-shrink-0">
                      <div className="text-sm font-inter font-medium text-sec-700">
                        {sector.percentage}%
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between mb-2">
                        <span className="font-inter text-sec-800 text-sm sm:text-base">
                          {sector.sector}
                        </span>
                        <span className="text-xs text-sec-500 font-inter">
                          {sector.source}
                        </span>
                      </div>
                      <div className="w-full bg-sec-100 rounded-full h-2">
                        <div
                          className="bg-sec-600 h-2 rounded-full transition-[width] duration-1000 ease-out"
                          style={{
                            width: animateSectorBars
                              ? `${sector.percentage}%`
                              : "0%",
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* How CarbonTrack Helps */}
        <section id="sub-how" className="py-8 sm:py-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-sec-50 rounded-xl flex items-center justify-center border border-sec-200">
              <FaLeaf className="w-6 h-6 text-sec-600" />
            </div>
            <div>
              <h2 className="text-3xl sm:text-4xl font-instru font-normal text-sec-900">
                Taking Action with CarbonTrack
              </h2>
              <p className="text-sec-600 font-inter mt-2">
                Practical steps to measure and reduce your impact
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: "Measure",
                title: "Track Your Emissions",
                desc: "Understand your current carbon footprint across all activities and identify key areas for improvement.",
                icon: FaChartLine,
                color: "bg-blue-50 border-blue-200",
              },
              {
                step: "Understand",
                title: "Analyze Impact Sources",
                desc: "Get detailed breakdowns of where your emissions come from and how they compare to averages.",
                icon: FaLightbulb,
                color: "bg-amber-50 border-amber-200",
              },
              {
                step: "Reduce",
                title: "Implement Changes",
                desc: "Follow personalized recommendations to reduce your footprint with measurable impact tracking.",
                icon: FaLeaf,
                color: "bg-green-50 border-green-200",
              },
            ].map((step, index) => (
              <div
                key={index}
                className="rounded-2xl p-6 border border-sec-200 text-center transition-all duration-300 hover:-translate-y-1"
              >
                <div
                  className={`w-16 h-16 ${step.color} rounded-2xl flex items-center justify-center mx-auto mb-4 border transition-transform duration-300 group-hover:scale-105`}
                >
                  <step.icon className="w-8 h-8 text-sec-600" />
                </div>
                <div className="text-sm sm:text-base font-inter font-medium text-sec-700 mb-2">
                  Step {step.step}
                </div>
                <h3 className="text-xl sm:text-2xl font-inter font-medium text-sec-800 mb-4">
                  {step.title}
                </h3>
                <p className="text-sm sm:text-base text-sec-600 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Reduction Strategies */}
        <section id="sub-reduce" className="py-8 sm:py-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center border border-green-200">
              <FaLeaf className="w-6 h-6 text-sec-600" />
            </div>
            <div>
              <h2 className="text-3xl sm:text-4xl font-instru font-normal text-sec-900">
                Evidence-Based Reduction Strategies
              </h2>
              <p className="text-sec-600 font-inter mt-2">
                Scientifically proven methods to lower your carbon footprint
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl sm:text-2xl font-inter font-medium text-sec-800 mb-6">
                High-Impact Individual Actions
              </h3>
              <div className="space-y-4">
                {[
                  {
                    action: "Switch to renewable energy",
                    impact:
                      "Reduces household emissions by up to 2.5 tons CO₂/year",
                    source: "Nature Energy 2020",
                    effectiveness: "Very High",
                  },
                  {
                    action: "Reduce air travel",
                    impact:
                      "One transatlantic flight avoided saves 1.6 tons CO₂",
                    source: "Atmospheric Environment 2020",
                    effectiveness: "High",
                  },
                  {
                    action: "Plant-based diet",
                    impact: "Reduces food emissions by 0.8 tons CO₂/year",
                    source: "Science 2018",
                    effectiveness: "High",
                  },
                  {
                    action: "Electric vehicle adoption",
                    impact: "Reduces transport emissions by 4.8 tons CO₂/year",
                    source: "ICCT 2022",
                    effectiveness: "Very High",
                  },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-xl border border-sec-200 transition-all duration-300 hover:-translate-y-1"
                  >
                    <div
                      className={`w-3 h-3 rounded-full mt-2 ${
                        item.effectiveness === "Very High"
                          ? "bg-green-500"
                          : "bg-blue-500"
                      }`}
                    ></div>
                    <div className="flex-1">
                      <h4 className="font-inter font-medium text-sec-800 mb-2 text-lg">
                        {item.action}
                      </h4>
                      <p className="text-sm sm:text-base text-sec-600 mb-3">
                        {item.impact}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-sec-500 font-inter">
                          {item.source}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            item.effectiveness === "Very High"
                              ? "bg-green-100 text-green-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {item.effectiveness} Impact
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-inter font-medium text-sec-800 mb-6">
                Collective Impact Potential
              </h3>
              <div className="rounded-2xl p-6 border border-sec-200 group transition-all duration-300 hover:-translate-y-1">
                <p className="text-sec-700 mb-6">
                  If adopted at scale, these individual actions could contribute
                  significantly to global emission reduction targets:
                </p>
                <div className="space-y-4">
                  {[
                    {
                      action: "Global renewable energy adoption",
                      reduction: "65% of energy emissions",
                      timeline: "By 2050",
                      source: "IEA Net Zero Scenario",
                    },
                    {
                      action: "Sustainable transportation",
                      reduction: "45% of transport emissions",
                      timeline: "By 2040",
                      source: "ITF Transport Outlook",
                    },
                    {
                      action: "Sustainable food systems",
                      reduction: "30% of food system emissions",
                      timeline: "By 2030",
                      source: "UN Food Systems Summit",
                    },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="border-l-4 border-sec-400 pl-4 py-2"
                    >
                      <h5 className="font-inter font-medium text-sec-800 mb-1">
                        {item.action}
                      </h5>
                      <p className="text-base text-sec-600 mb-2">
                        Potential reduction:{" "}
                        <span className="font-medium text-sec-700">
                          {item.reduction}
                        </span>
                      </p>
                      <div className="flex justify-between text-xs text-sec-500">
                        <span>Target: {item.timeline}</span>
                        <span>{item.source}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Global Perspective */}
        <section id="sub-global" className="py-8 sm:py-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-sky-50 rounded-xl flex items-center justify-center border border-sky-200">
              <GiWorld className="w-6 h-6 text-sky-600" />
            </div>
            <div>
              <h2 className="text-3xl sm:text-4xl font-instru font-normal text-sec-900">
                Global Carbon Landscape
              </h2>
              <p className="text-sec-600 font-inter mt-2">
                Understanding emissions in a global context
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl sm:text-2xl font-inter font-medium text-sec-800 mb-6">
                Per Capita Emissions by Country
              </h3>
              <div className="rounded-2xl p-6 border border-sec-200">
                <div className="space-y-3">
                  {GLOBAL_DATA.perCapitaEmissions.map((country, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-3 border-b border-sec-100 last:border-b-0"
                    >
                      <div className="flex items-center  gap-3">
                        <div
                          className={`w-3 h-3 rounded-full  ${
                            parseEmissions(country.emissions) > 15
                              ? "bg-red-500"
                              : parseEmissions(country.emissions) > 8
                              ? "bg-orange-400"
                              : parseEmissions(country.emissions) > 4
                              ? "bg-yellow-400"
                              : parseEmissions(country.emissions) > 2
                              ? "bg-green-400"
                              : "bg-green-700"
                          }`}
                        ></div>
                        <div>
                          <span className="font-inter text-sec-800">
                            {country.country}
                          </span>
                          <div className="text-xs text-sec-500 font-inter">
                            {country.source}
                          </div>
                        </div>
                      </div>

                      <div className="ml-4 flex items-center gap-3 ">
                        <div className="w-40 sm:w-56 bg-sec-100 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-2 ${
                              parseEmissions(country.emissions) > 15
                                ? "bg-orange-700"
                                : parseEmissions(country.emissions) > 8
                                ? "bg-orange-400"
                                : parseEmissions(country.emissions) > 4
                                ? "bg-yellow-500"
                                : parseEmissions(country.emissions) > 2
                                ? "bg-green-400"
                                : "bg-green-700"
                            } rounded-full transition-all duration-700`}
                            style={{
                              width: animatePerCapitaBars
                                ? `${
                                    maxEmission > 0
                                      ? (parseEmissions(country.emissions) /
                                          maxEmission) *
                                        100
                                      : 0
                                  }%`
                                : "0%",
                              transitionDelay: `${index * 80}ms`,
                            }}
                          />
                        </div>
                        <div className="font-inter font-medium text-sec-800 text-sm">
                          {country.emissions} CO₂/year
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl font-inter font-medium text-sec-800 mb-6">
                The Path to Net Zero
              </h3>
              <div className="rounded-2xl p-6 border border-sec-200 group transition-all duration-300 hover:-translate-y-1">
                <p className="text-sm sm:text-base text-sec-700 mb-6">
                  To limit global warming to 1.5°C, global CO₂ emissions must
                  reach net zero by 2050. This requires unprecedented changes
                  across all sectors of the economy.
                </p>
                <div className="space-y-4">
                  {[
                    {
                      year: "2030",
                      target: "45% reduction from 2010 levels",
                      requirement:
                        "Rapid deployment of existing clean technologies",
                      status: "On track: No",
                    },
                    {
                      year: "2040",
                      target: "80% reduction from 2010 levels",
                      requirement: "Global energy system transformation",
                      status: "Action needed",
                    },
                    {
                      year: "2050",
                      target: "Net zero emissions",
                      requirement:
                        "Complete decarbonization with carbon removal",
                      status: "Achievable with current action",
                    },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="border-l-4 border-sec-400 pl-4 py-2"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-inter font-medium text-sec-800">
                          {item.year}
                        </span>
                        <span className="text-base text-sec-600">
                          • {item.target}
                        </span>
                      </div>
                      <p className="text-base text-sec-600 mb-2">
                        {item.requirement}
                      </p>
                      <div
                        className={`text-xs px-2 py-1 rounded-full inline-block ${
                          item.status === "On track: No"
                            ? "bg-red-100 text-red-800"
                            : item.status === "Action needed"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {item.status}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-xs text-sec-500 font-inter">
                  Source: IPCC AR6 Synthesis Report 2023
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section id="sub-cta" className="py-12 sm:py-16 text-center">
          <div className="max-w-2xl mx-auto">
            <div className="w-20 h-20 bg-sec-50 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-sec-200">
              <GiEarthAmerica className="w-10 h-10 text-sec-600" />
            </div>

            <h3 className="text-3xl sm:text-4xl lg:text-5xl font-instru font-normal text-sec-900 mb-6">
              Ready to Make a Difference?
            </h3>

            <p className="text-lg text-sec-700 mb-8 leading-relaxed">
              Start tracking your carbon footprint today and join millions
              taking meaningful climate action. Small changes, when multiplied
              by millions of people, can transform the world.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <div className="btn-3d-wrapper">
                <div className="btn-3d-offset" aria-hidden />
                <button
                  onClick={() => navigate("/dashboard")}
                  className=" !bg-sec-600 btn-3d btn-3d--primary"
                >
                  <span className="flex items-center gap-2 text-md text-prim-100 font-inter font-medium">
                    Start Tracking Now
                    <FaArrowRight className="w-4 h-4" />
                  </span>
                </button>
              </div>
            </div>

            <div className="mt-8 text-sm text-sec-600 font-inter max-w-md mx-auto">
              "The greatest threat to our planet is the belief that someone else
              will save it."
              <span className="block mt-1 text-sec-500">- Robert Swan</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
