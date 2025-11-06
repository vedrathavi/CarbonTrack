import React, { useEffect, useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import useAppStore from "@/stores/useAppStore";
import logoImg from "@/assets/logo.svg";
import {
  FiHome,
  FiBook,
  FiGrid,
  FiSettings,
  FiUser,
  FiChevronDown,
  FiChevronRight,
  FiLogOut,
} from "react-icons/fi";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { toast } from "sonner";

const Icon = ({ name, className = "w-5 h-5" }) => {
  switch (name) {
    case "dashboard":
      return <FiHome className={className} />;
    case "education":
      return <FiBook className={className} />;
    case "option":
      return <FiGrid className={className} />;
    case "profile":
      return <FiUser className={className} />;
    default:
      return <FiSettings className={className} />;
  }
};

const sections = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: "dashboard",
    subs: [
      { id: "sub-1", label: "Overview" },
      { id: "sub-2", label: "Analytics" },
      { id: "sub-3", label: "Insights" },
    ],
  },
  {
    key: "education",
    label: "Education",
    icon: "education",
    subs: [
      { id: "sub-hero", label: "Carbon Footprint" },
      { id: "sub-what", label: "What is Carbon Footprint" },
      { id: "sub-why", label: "Why It Matters" },
      { id: "sub-sources", label: "Emission Sources" },
      { id: "sub-how", label: "How CarbonTrack Helps" },
      { id: "sub-reduce", label: "Reduction Strategies" },
      { id: "sub-global", label: "Global Impact" },
      { id: "sub-cta", label: "Get Started" },
    ],
  },
  {
    key: "option3",
    label: "Option 3",
    icon: "option",
    subs: [
      { id: "sub-1", label: "Sub-option 1" },
      { id: "sub-2", label: "Sub-option 2" },
      { id: "sub-3", label: "Sub-option 3" },
    ],
  },
  {
    key: "option4",
    label: "Option 4",
    icon: "option",
    subs: [
      { id: "sub-1", label: "Sub-option 1" },
      { id: "sub-2", label: "Sub-option 2" },
      { id: "sub-3", label: "Sub-option 3" },
    ],
  },
];

export default function Sidebar({ collapsed, setCollapsed, onCloseDrawer }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [openMenu, setOpenMenu] = useState(null);
  const [activeSub, setActiveSub] = useState(null);
  const logout = useAppStore((s) => s.logout);

  const handleLogout = async () => {
    try {
      await logout();
      if (onCloseDrawer) onCloseDrawer();
      navigate("/");
      toast.success("Logged out successfully");
    } catch (e) {
      const msg =
        e?.message || (e?.response?.data?.message ?? "Failed to log out");
      toast.error(String(msg));
    }
  };

  // Keep submenu in sync with current route
  useEffect(() => {
    const top = location.pathname.split("/")[1] || "dashboard";
    // normalize dashboard path
    const current = top === "" ? "dashboard" : top;
    if (current !== openMenu) setOpenMenu(current);
  }, [location.pathname, openMenu]);

  // Highlight active sub-option based on scroll events from sections
  useEffect(() => {
    const handler = (e) => {
      const { section, sub } = e.detail || {};
      if (!section || !sub) return;
      setOpenMenu(section); // ensure submenu is open/visible
      setActiveSub(sub);
    };
    window.addEventListener("active-sub", handler);
    return () => window.removeEventListener("active-sub", handler);
  }, []);

  // removed toggleMenu in favor of direct navigation on section click

  const handleSectionClick = (secKey) => {
    const path = secKey === "dashboard" ? "/dashboard" : `/${secKey}`;
    navigate(path);
    setOpenMenu(secKey);
  };

  const handleSubClick = (secKey, subId) => {
    // Navigate to section page then dispatch scroll event
    // avoid /dashboard/dashboard path for the main dashboard
    navigate(secKey === "dashboard" ? `/dashboard` : `/${secKey}`);
    // open the menu for visual feedback
    setOpenMenu(secKey);
    setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent("scroll-to", {
          detail: { section: secKey, sub: subId },
        })
      );
    }, 120);
  };

  const userInfo = useAppStore((s) => s.userInfo);
  const displayName = userInfo?.firstName || userInfo?.name || "User";
  const avatarUrl =
    userInfo?.photo ||
    userInfo?.picture ||
    userInfo?.avatar ||
    userInfo?.photoUrl ||
    userInfo?.profilePic;
  const isProfileActive = location.pathname === "/profile";

  return (
    <aside
      className={`flex flex-col bg-neu-0  transition-all duration-300 ease-in-out ${
        collapsed ? "w-20" : "w-64"
      } h-screen overflow-hidden`}
    >
      <div className="flex items-center justify-between px-4 py-3 relative">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              // If collapsed, expand first (do not reload)
              if (collapsed) {
                setCollapsed(false);
                if (location.pathname !== "/dashboard") navigate("/dashboard");
                return;
              }

              // If already on dashboard and expanded, reload; otherwise navigate there
              if (location.pathname === "/dashboard") {
                window.location.reload();
              } else {
                navigate("/dashboard");
              }
            }}
            aria-label="Go to dashboard"
            className="flex items-center gap-3 focus:outline-none group"
          >
            <div className="w-8 h-8 rounded-sm overflow-hidden flex items-center justify-center relative">
              {/* logo visible by default; when collapsed and hovered, show chevron instead */}
              <img
                src={logoImg}
                alt="CarbonTrack logo"
                className={`w-full h-full object-contain transition-opacity ${
                  collapsed ? "group-hover:opacity-0" : "opacity-100"
                }`}
              />

              {collapsed && (
                <div className="absolute inset-0 flex items-center justify-center bg-green-100 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                  <FiChevronRight className="size-6  text-sec-600" />
                </div>
              )}
            </div>
            {!collapsed && (
              <span className="font-instru text-3xl text-sec-600">
                CarbonTrack
              </span>
            )}
          </button>
        </div>
        {!collapsed && (
          <button
            aria-label={onCloseDrawer ? "Close drawer" : "Toggle sidebar"}
            onClick={() => {
              if (onCloseDrawer) {
                onCloseDrawer();
                return;
              }
              setCollapsed((c) => !c);
            }}
            className="p-1 rounded hover:bg-gray-100 md:static absolute right-0 top-4"
          >
            <FiChevronDown className="w-5 h-5 text-neu-400 transform rotate-90" />
          </button>
        )}
      </div>

      <nav className="flex-1 px-2 py-4 overflow-auto no-scrollbar">
        {sections.map((sec) => {
          const active =
            (sec.key === "dashboard" && location.pathname === "/dashboard") ||
            (!["dashboard"].includes(sec.key) &&
              location.pathname.startsWith(`/${sec.key}`));
          return (
            <div key={sec.key} className=" mb-1">
              <div
                className={`flex items-center gap-3 cursor-pointer px-3 py-1 rounded-md transition-colors ${
                  active
                    ? "bg-green-50 text-green-700"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
                onClick={() => {
                  // Navigate to section and open submenu for visual feedback
                  handleSectionClick(sec.key);
                  setOpenMenu(sec.key);
                }}
              >
                <div className="flex items-center justify-center w-8 h-8 text-xl">
                  <Icon name={sec.icon} />
                </div>
                {!collapsed && (
                  <div className="flex-1 font-medium text-sm">{sec.label}</div>
                )}
                {/* no collapse chevron here - clicking the row navigates */}
              </div>

              {/* Submenu */}
              <div
                className={`mt-1 pr-2 transition-all duration-200 ${
                  openMenu === sec.key
                    ? "max-h-96 opacity-100"
                    : "max-h-0 opacity-0 overflow-hidden"
                } ${collapsed ? "pl-2" : "pl-10"}`}
              >
                {sec.subs?.map((sub) => {
                  return (
                    <button
                      key={sub.id}
                      onClick={() => handleSubClick(sec.key, sub.id)}
                      className={`block w-full ${
                        collapsed
                          ? "flex items-center justify-center px-0 py-1"
                          : "text-left px-2 py-2"
                      } rounded-md text-sm ${
                        activeSub === sub.id && openMenu === sec.key
                          ? "bg-green-100 text-green-800"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {!collapsed ? (
                        sub.label
                      ) : (
                        <span
                          className={`w-2 h-2 block rounded-full ${
                            activeSub === sub.id && openMenu === sec.key
                              ? "bg-green-700"
                              : "bg-green-300"
                          }`}
                          aria-hidden
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      <div className="px-3 py-1 border-t border-gray-100">
        <div
          className={`flex items-center gap-3 cursor-pointer px-2 py-2 rounded-md transition-colors ${
            isProfileActive
              ? "bg-green-50 text-green-700"
              : "text-gray-700 hover:bg-gray-50"
          }`}
          onClick={() => {
            navigate("/profile");
            // clear open menus so other options are not shown as active
            setOpenMenu(null);
            setActiveSub(null);
            if (onCloseDrawer) onCloseDrawer();
          }}
          role="button"
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="avatar"
              className={`w-10 h-10 ${
                isProfileActive
                  ? "border border-green-400 "
                  : "border border-neu-200"
              } rounded-full object-cover transition-all duration-200`}
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-orange-700 flex items-center justify-center text-lg font-instru text-prim-100">
              {String(displayName)
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")}
            </div>
          )}
          {!collapsed && (
            <div className="flex-1">
              <div className="text-sm font-medium">{displayName}</div>
              <div className="text-xs text-gray-500">View Profile</div>
            </div>
          )}
        </div>
      </div>
      {/* Single logout button below profile */}
      <div className="px-3 pb-3">
        <Dialog>
          <DialogTrigger asChild>
            {collapsed ? (
              <button
                type="button"
                className="w-full flex items-center justify-center px-2 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                aria-label="Logout"
              >
                <FiLogOut className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-50"
              >
                <FiLogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            )}
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">
                Confirm logout
              </DialogTitle>
              <DialogDescription className="text-lg">
                Are you sure you want to sign out?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <div className="btn-3d-wrapper">
                <div className="btn-3d-offset" aria-hidden />
                <DialogClose asChild>
                  <button className="btn-3d btn-3d--light">Cancel</button>
                </DialogClose>
              </div>

              <div className="btn-3d-wrapper">
                <div className="btn-3d-offset" aria-hidden />
                <button
                  onClick={handleLogout}
                  className="btn-3d btn-3d--primary"
                >
                  <span className="text-md text-prim-100 font-inter font-medium">
                    Log Out
                  </span>
                </button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </aside>
  );
}
