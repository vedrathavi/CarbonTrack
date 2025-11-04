import React from "react";
import useAppStore from "@/stores/useAppStore";

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

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Profile</h2>
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center gap-4 mb-4">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={`${displayName} avatar`}
              className="w-16 h-16 rounded-full border-neu-100 border object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-prim-600   text-neu-0 flex items-center justify-center text-xl">
              {String(displayName)
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")}
            </div>
          )}
          <div>
            <div className="text-lg font-medium">{displayName}</div>
            <div className="text-sm text-gray-500">{user?.email || "-"}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-gray-500">First Name</div>
            <div className="font-medium">{firstName}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Last Name</div>
            <div className="font-medium">{lastName}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Email</div>
            <div className="font-medium">{user?.email || "-"}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Household</div>
            <div className="font-medium">{user?.householdId || "-"}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
