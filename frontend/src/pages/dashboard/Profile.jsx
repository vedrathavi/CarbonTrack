import React, { useEffect } from "react";
import useAppStore from "@/stores/useAppStore";
import useHomeHook from "@/hooks/useHomeHook";
import HomeMembers from "@/components/Dashboard/HomeMembers";
import {
  FiMail,
  FiHome,
  FiMapPin,
  FiLayers,
  FiZap,
  FiUser,
  FiUsers,
  FiCopy,
  FiCalendar,
  FiShare2,
} from "react-icons/fi";
import { toast } from "sonner";

export default function Profile() {
  const user = useAppStore((s) => s.userInfo) || {};

  const displayName = user?.firstName || user?.name || "User";
  const avatarUrl =
    user?.photo ||
    user?.picture ||
    user?.avatar ||
    user?.photoUrl ||
    user?.profilePic;

  const firstName = user?.firstName || user?.name?.split(" ")?.[0] || "-";
  const lastName = user?.lastName || user?.name?.split(" ")?.[1] || "-";

  const { home, fetchMyHome } = useHomeHook();
  const resolvedHome = home?.data?.home ?? home?.home ?? home ?? null;

  useEffect(() => {
    if (!resolvedHome) fetchMyHome().catch(() => {});
  }, [resolvedHome, fetchMyHome]);

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

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const formatEmissionFactor = (factor) => {
    if (!factor) return "-";
    const num = parseFloat(factor);
    return isNaN(num) ? factor : `${num.toFixed(2)} gCO₂/kWh`;
  };

  const copyHouseholdId = async () => {
    const id = resolvedHome?.homeCode;
    if (!id) {
      toast.error("No household ID available to copy");
      return;
    }
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(id);
      } else {
        const ta = document.createElement("textarea");
        ta.value = id;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      toast.success("🏠 Household ID copied to clipboard!");
    } catch (err) {
      console.error("copyHouseholdId error", err);
      toast.error("Failed to copy household ID");
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-6">
      {/* Header with Household ID */}
      <div className="bg-neu-0 rounded-2xl border border-prim-200 p-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            {avatarUrl ? (
              <div className="w-20 h-20 rounded-xl border border-prim-200 overflow-hidden">
                <img
                  src={avatarUrl}
                  alt={`${displayName} avatar`}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-xl border border-prim-200 bg-gradient-to-br from-prim-500 to-prim-400 text-neu-0 flex items-center justify-center text-2xl font-instru">
                {String(displayName)
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")}
              </div>
            )}
            <div>
              <h1 className="text-3xl font-instru text-sec-900 mb-2">
                {displayName}
              </h1>
              <div className="flex items-center gap-2 text-sec-700 font-inter">
                <FiMail className="w-4 h-4" />
                <span>{user?.email || "-"}</span>
              </div>
              {user?.createdAt && (
                <div className="flex items-center gap-2 text-sec-600 text-sm font-inter mt-2">
                  <FiCalendar className="w-3 h-3" />
                  <span>Joined {formatDate(user.createdAt)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Household ID - Featured Section */}
          <div className="bg-prim-50 border border-prim-300 rounded-xl p-6 min-w-[280px]">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-prim-100 rounded-lg flex items-center justify-center border border-prim-200">
                <FiHome className="w-5 h-5 text-prim-600" />
              </div>
              <div>
                <div className="text-sm font-inter font-medium text-sec-700">
                  Household ID
                </div>
                <div className="text-xs text-sec-600">
                  Share to invite members
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1 bg-neu-0 border border-prim-200 rounded-lg p-3">
                <div className="font-mono text-base text-sec-900 tracking-wide text-center">
                  {resolvedHome?.homeCode || "NO-ID-AVAILABLE"}
                </div>
              </div>
              <button
                onClick={copyHouseholdId}
                className="w-10 h-10 bg-prim-500 border border-prim-600 rounded-lg flex items-center justify-center hover:bg-prim-600 transition-colors"
                title="Copy Household ID"
              >
                <FiCopy className="w-4 h-4 text-prim-100" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column - Personal Info & Household */}
        <div className="xl:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="bg-neu-0 rounded-2xl border border-prim-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-prim-100 rounded-lg flex items-center justify-center border border-prim-200">
                <FiUser className="w-4 h-4 text-prim-600" />
              </div>
              <h2 className="text-xl font-instru text-sec-900">
                Personal Information
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-inter font-medium text-sec-600">
                  First Name
                </label>
                <div className="p-3 bg-prim-50 border border-prim-200 rounded-lg text-sec-900 font-inter">
                  {firstName}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-inter font-medium text-sec-600">
                  Last Name
                </label>
                <div className="p-3 bg-prim-50 border border-prim-200 rounded-lg text-sec-900 font-inter">
                  {lastName}
                </div>
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-inter font-medium text-sec-600">
                  Email Address
                </label>
                <div className="p-3 bg-prim-50 border border-prim-200 rounded-lg text-sec-900 font-inter flex items-center gap-2">
                  <FiMail className="w-4 h-4 text-prim-600" />
                  {user?.email || "-"}
                </div>
              </div>
            </div>
          </div>

          {/* Household Members */}
          <div className="bg-neu-0 rounded-2xl border border-prim-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-sec-100 rounded-lg flex items-center justify-center border border-sec-200">
                <FiUsers className="w-4 h-4 text-sec-600" />
              </div>
              <h2 className="text-xl font-instru text-sec-900">
                Household Members
              </h2>
            </div>
            <div className="bg-sec-50 border border-sec-200 rounded-lg overflow-hidden">
              <HomeMembers />
            </div>
          </div>
        </div>

        {/* Right Column - Home Details & Actions */}
        <div className="space-y-6">
          {/* Home Details */}
          <div className="bg-neu-0 rounded-2xl border border-prim-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-sec-100 rounded-lg flex items-center justify-center border border-sec-200">
                <FiHome className="w-4 h-4 text-sec-600" />
              </div>
              <h2 className="text-xl font-instru text-sec-900">Home Details</h2>
            </div>

            <div className="space-y-6">
              {/* Location */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-prim-100 rounded flex items-center justify-center border border-prim-200">
                    <FiMapPin className="w-3 h-3 text-prim-600" />
                  </div>
                  <h3 className="font-inter font-medium text-sec-800">
                    Location
                  </h3>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <div className="p-2 bg-prim-50 border border-prim-200 rounded-lg">
                    <div className="text-xs font-inter font-medium text-sec-600">
                      City
                    </div>
                    <div className="text-sec-900 font-inter">
                      {resolvedHome?.address?.city || "-"}
                    </div>
                  </div>
                  <div className="p-2 bg-prim-50 border border-prim-200 rounded-lg">
                    <div className="text-xs font-inter font-medium text-sec-600">
                      State/Region
                    </div>
                    <div className="text-sec-900 font-inter">
                      {resolvedHome?.address?.state || "-"}
                    </div>
                  </div>
                  <div className="p-2 bg-prim-50 border border-prim-200 rounded-lg">
                    <div className="text-xs font-inter font-medium text-sec-600">
                      Country
                    </div>
                    <div className="text-sec-900 font-inter">
                      {getCountryName(resolvedHome?.address?.country) || "-"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Specifications */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-sec-100 rounded flex items-center justify-center border border-sec-200">
                    <FiLayers className="w-3 h-3 text-sec-600" />
                  </div>
                  <h3 className="font-inter font-medium text-sec-800">
                    Specifications
                  </h3>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <div className="p-2 bg-sec-50 border border-sec-200 rounded-lg">
                    <div className="text-xs font-inter font-medium text-sec-600">
                      Total Rooms
                    </div>
                    <div className="text-lg font-instru text-sec-900">
                      {resolvedHome?.totalRooms ?? "-"}
                    </div>
                  </div>
                  <div className="p-2 bg-sec-50 border border-sec-200 rounded-lg">
                    <div className="text-xs font-inter font-medium text-sec-600">
                      Emission Factor
                    </div>
                    <div className="text-sec-900 font-inter">
                      {formatEmissionFactor(resolvedHome?.emissionFactor)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Appliances */}
              {resolvedHome?.appliances &&
                Object.keys(resolvedHome.appliances).length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-prim-100 rounded flex items-center justify-center border border-prim-200">
                        <FiZap className="w-3 h-3 text-prim-600" />
                      </div>
                      <h3 className="font-inter font-medium text-sec-800">
                        Appliances
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      {Object.entries(resolvedHome.appliances).map(
                        ([appliance, count]) => (
                          <div
                            key={appliance}
                            className="p-2 bg-prim-50 border border-prim-200 rounded-lg hover:border-prim-300 transition-colors"
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-inter text-sec-800 capitalize text-sm">
                                {appliance.replace(/([A-Z])/g, " $1").trim()}
                              </span>
                              <span className="font-instru text-prim-600">
                                {count}
                              </span>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-neu-0 rounded-2xl border border-prim-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-sec-100 rounded-lg flex items-center justify-center border border-sec-200">
                <FiShare2 className="w-4 h-4 text-sec-600" />
              </div>
              <h2 className="text-xl font-instru text-sec-900">
                Quick Actions
              </h2>
            </div>

            <div className="space-y-3">
              <button
                onClick={copyHouseholdId}
                className="w-full p-3 bg-prim-50 border border-prim-200 rounded-lg hover:bg-prim-100 hover:border-prim-300 transition-all duration-200 text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-prim-100 rounded flex items-center justify-center border border-prim-200">
                    <FiCopy className="w-4 h-4 text-prim-600" />
                  </div>
                  <div>
                    <div className="font-inter font-medium text-sec-800">
                      Copy Household ID
                    </div>
                    <div className="text-xs text-sec-600">
                      Share with family members
                    </div>
                  </div>
                </div>
              </button>

              <button className="w-full p-3 bg-sec-50 border border-sec-200 rounded-lg hover:bg-sec-100 hover:border-sec-300 transition-all duration-200 text-left">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-sec-100 rounded flex items-center justify-center border border-sec-200">
                    <FiUser className="w-4 h-4 text-sec-600" />
                  </div>
                  <div>
                    <div className="font-inter font-medium text-sec-800">
                      Edit Profile
                    </div>
                    <div className="text-xs text-sec-600">
                      Update personal details
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
