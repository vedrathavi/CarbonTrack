import React, { useEffect, useState } from "react";
import useAppStore from "@/stores/useAppStore";

export default function HomeMembers() {
  const fetchMyHome = useAppStore((s) => s.fetchMyHome);
  const fetchHomeMembers = useAppStore((s) => s.fetchHomeMembers);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        // ensure we have a home loaded (no-op if already present)
        await fetchMyHome();
  const data = await fetchHomeMembers();
  // Normalize response: store method should return an array, but handle several shapes
  let list = [];
  if (Array.isArray(data)) list = data;
  else if (data && Array.isArray(data.members)) list = data.members;
  else if (data && data.data && Array.isArray(data.data.members)) list = data.data.members;
  else list = [];
  if (mounted) setMembers(list);
      } catch (err) {
        if (mounted)
          setError(err?.response?.data?.message || err?.message || "Failed to load members");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [fetchMyHome, fetchHomeMembers]);

  if (loading) return <div>Loading members...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!members || members.length === 0)
    return <div className="text-sm text-gray-500">No members found.</div>;

  return (
    <div className="space-y-2">
      {members.map((m) => (
        <div
          key={m.user?._id || m.user?.id}
          className="flex items-center gap-3 p-2 rounded-md hover:bg-neu-50"
        >
          <img
            src={m.user?.profilePic || m.user?.photo || ""}
            alt={m.user?.name || m.user?.email}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm truncate">{m.user?.name || m.user?.email}</div>
            <div className="text-xs text-gray-500 truncate">{m.user?.email}</div>
          </div>
          <div className="text-xs px-2 py-1 rounded-md bg-prim-50 text-prim-700">{m.role}</div>
        </div>
      ))}
    </div>
  );
}
