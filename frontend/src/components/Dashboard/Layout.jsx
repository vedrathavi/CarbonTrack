import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";
import { FiMenu, FiMapPin } from "react-icons/fi";
import { Zap } from "lucide-react";
import useAppStore from "@/stores/useAppStore";

export default function DashboardLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileClosing, setMobileClosing] = useState(false);
  const userInfo = useAppStore((s) => s.userInfo) || {};
  const home = useAppStore((s) => s.home);
  const resolvedHome = home?.data?.home ?? home?.home ?? home ?? null;
  const firstName =
    userInfo?.firstName || (userInfo?.name || "").split(" ")[0] || "User";
  
  const getCountryName = (countryVal) => {
    if (!countryVal) return null;
    const code = String(countryVal).trim();
    if (/^[A-Za-z]{2}$/.test(code)) {
      try {
        const dn = new Intl.DisplayNames(["en"], { type: "region" });
        return dn.of(code.toUpperCase()) || code;
      } catch {
        return code;
      }
    }
    return countryVal;
  };
  
  const formatEmissionFactor = (factor) => {
    if (!factor) return null;
    const num = parseFloat(factor);
    return isNaN(num) ? null : `${num.toFixed(2)} gCO₂/kWh`;
  };
  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good Morning";
    if (h < 18) return "Good Afternoon";
    return "Good Evening";
  })();
  const mdMarginClass = collapsed ? "md:ml-20" : "md:ml-64";
  useEffect(() => {
    const prev = document.body.style.overflow;
    if (mobileOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = prev || "";
    return () => {
      document.body.style.overflow = prev || "";
    };
  }, [mobileOpen]);

  const closeDrawer = () => {
    setMobileClosing(true);
    // leave enough time for the css animation to complete
    setTimeout(() => {
      setMobileClosing(false);
      setMobileOpen(false);
    }, 260);
  };

  const toggleDrawer = () => {
    if (mobileOpen) closeDrawer();
    else setMobileOpen(true);
  };

  return (
    <div className="min-h-screen flex bg-prim-100/50 overflow-x-hidden">
      {/* Desktop sidebar (fixed) */}
      <div className="hidden md:flex md:fixed md:inset-y-0 md:left-0">
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      </div>

      {/* Desktop header moved back into main — not fixed */}

      {/* Mobile: render only a compact fixed menu button (no full header) */}
      <div className="md:hidden">
        <button
          onClick={toggleDrawer}
          aria-label="Open menu"
          className="fixed top-3 left-3 z-40 p-2"
        >
          <FiMenu className="w-5 h-5" />
        </button>
      </div>

      {(mobileOpen || mobileClosing) && (
        <div
          className={`md:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity duration-200 ${
            mobileClosing ? "opacity-0" : "opacity-100"
          }`}
          onClick={() => closeDrawer()}
        >
          <div
            className={`bg-white p-2 max-w-68  h-full ${
              mobileClosing ? "slide-out-left" : "slide-in-left"
            } shadow-2xl`}
            onClick={(e) => e.stopPropagation()}
          >
            <Sidebar
              collapsed={false}
              setCollapsed={() => {}}
              onCloseDrawer={() => closeDrawer()}
            />
          </div>
        </div>
      )}

      {/* prevent background scroll when drawer open */}
      {/** lock body scroll while drawer is open */}

      <main
        className={`${mdMarginClass} flex-1 pt-4 transition-all overflow-auto`}
      >
        <div className="mx-3 md:mx-8 ">
          {/* header area (inside scrollable content) */}
          <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="text-2xl md:text-3xl text-sec-700 font-inter font-semibold tracking-tighter flex md:px-4 items-center gap-2 px-10">
              <span className="truncate">
                {greeting}, <span className="font-semibold">{firstName}</span>!
              </span>
            </div>
            
            {/* Emission Factor & Country */}
            <div className="flex items-center gap-3 px-10 sm:px-0">
              {formatEmissionFactor(resolvedHome?.emissionFactor) && (
                <div className="flex items-center gap-2 bg-prim-50 border border-prim-200 rounded-lg px-3 py-1.5">
                  <Zap className="w-4 h-4 text-prim-600 flex-shrink-0" />
                  <span className="text-xs font-inter font-medium text-sec-700 whitespace-nowrap">
                    {formatEmissionFactor(resolvedHome.emissionFactor)}
                  </span>
                </div>
              )}
              {getCountryName(resolvedHome?.address?.country) && (
                <div className="flex items-center gap-2 bg-sec-50 border border-sec-200 rounded-lg px-3 py-1.5">
                  <FiMapPin className="w-4 h-4 text-sec-600 flex-shrink-0" />
                  <span className="text-xs font-inter font-medium text-sec-700 whitespace-nowrap">
                    {getCountryName(resolvedHome.address.country)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* content area - make this box scrollable while page/chrome stays fixed */}
          <div className="rounded-lg md:p-4 overflow-auto max-h-[calc(100vh-6rem)] no-scrollbar">
            {/* allow nested routes via Outlet */}
            {children || <Outlet />}
          </div>
        </div>
      </main>
    </div>
  );
}
