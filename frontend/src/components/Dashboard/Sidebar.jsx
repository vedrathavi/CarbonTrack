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
  { key: "dashboard", label: "Dashboard", icon: "dashboard" },
  { key: "education", label: "Education", icon: "education" },
  { key: "option3", label: "Option 3", icon: "option" },
  { key: "option4", label: "Option 4", icon: "option" },
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

  useEffect(() => {
    const handler = (e) => {
      const { section, sub } = e.detail || {};
      if (section && section === openMenu) setActiveSub(sub);
    };
    window.addEventListener("active-sub", handler);
    return () => window.removeEventListener("active-sub", handler);
  }, [openMenu]);

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
            className="flex items-center gap-3 focus:outline-none"
          >
            <div className="w-8 h-8 rounded-sm overflow-hidden flex items-center justify-center">
              <img
                src={logoImg}
                alt="CarbonTrack logo"
                className="w-full h-full object-contain"
              />
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

      <nav className="flex-1 px-2 py-4 overflow-auto">
        {sections.map((sec) => {
          const active =
            (sec.key === "dashboard" && location.pathname === "/dashboard") ||
            (!["dashboard"].includes(sec.key) &&
              location.pathname.startsWith(`/${sec.key}`));
          return (
            <div key={sec.key} className="mb-2">
              <div
                className={`flex items-center gap-3 cursor-pointer px-3 py-2 rounded-md transition-colors ${
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
                  <div className="flex-1 font-medium">{sec.label}</div>
                )}
                {/* no collapse chevron here - clicking the row navigates */}
              </div>

              {/* Submenu */}
              <div
                className={`mt-1 pr-2 transition-all duration-200 ${
                  openMenu === sec.key
                    ? "max-h-40 opacity-100"
                    : "max-h-0 opacity-0 overflow-hidden"
                } ${collapsed ? "pl-2" : "pl-10"}`}
              >
                {[1, 2, 3].map((i) => {
                  const subId = `sub-${i}`;
                  return (
                    <button
                      key={i}
                      onClick={() => handleSubClick(sec.key, subId)}
                      className={`block w-full ${
                        collapsed
                          ? "flex items-center justify-center px-0 py-1"
                          : "text-left px-2 py-2"
                      } rounded-md text-sm ${
                        activeSub === subId && openMenu === sec.key
                          ? "bg-green-100 text-green-800"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {!collapsed ? (
                        `Sub-option ${i}`
                      ) : (
                        <span
                          className="w-2 h-2 block rounded-full bg-green-300"
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

      <div className="px-3 py-3 border-t border-gray-100">
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
      <div className="px-3 pb-6">
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
