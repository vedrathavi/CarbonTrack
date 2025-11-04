import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";
import { FiMenu } from "react-icons/fi";
import useAppStore from "@/stores/useAppStore";

export default function DashboardLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileClosing, setMobileClosing] = useState(false);
  const userInfo = useAppStore((s) => s.userInfo) || {};
  const firstName =
    userInfo?.firstName || (userInfo?.name || "").split(" ")[0] || "User";
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
          <div className="mb-4 flex items-center justify-between">
            <div className="text-2xl md:text-3xl text-sec-700 font-inter font-semibold tracking-tighter flex md:px-4 items-center gap-2 px-10">
              <span className="truncate">
                {greeting}, <span className="font-semibold">{firstName}</span>!
              </span>
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
