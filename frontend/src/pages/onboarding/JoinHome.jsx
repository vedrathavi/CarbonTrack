import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import apiClient from "@/lib/apiClient";
import { JOIN_HOME_ROUTE } from "@/utils/constants";
import useAppStore from "@/stores/useAppStore";
import family from "@/assets/family.svg";
import { IoArrowBackOutline } from "react-icons/io5";
export default function JoinHome() {
  const navigate = useNavigate();
  const { fetchUser, logout } = useAppStore();
  const [homeCode, setHomeCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
    navigate("/");
  };

  const handleJoinHome = async (e) => {
    e.preventDefault();

    if (!homeCode.trim()) {
      toast.error("Please enter a home code");
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post(JOIN_HOME_ROUTE, {
        homeCode: homeCode.trim(),
      });

      if (response.data.status === "success") {
        // Fetch updated user info to get the householdId
        await fetchUser();

        toast.success("Successfully joined home!");
        navigate("/dashboard");
      }
    } catch (error) {
      const message =
        error.response?.data?.message || "Invalid home code. Please try again.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-prim-100 flex items-center justify-center p-4 py-12 relative overflow-hidden">
      {/* Logout Button */}
      <div className="absolute top-6 right-6 z-50">
        <div className="btn-3d-wrapper">
          <div className="btn-3d-offset" aria-hidden />
          <button onClick={handleLogout} className="btn-3d btn-3d--primary">
            <span className="text-md text-prim-100 font-inter font-medium">
              Log Out
            </span>
          </button>
        </div>
      </div>

      {/* Background Illustration - Fixed Position */}
      <div className="absolute inset-0 hidden md:flex items-center justify-end pr-20 pointer-events-none z-0">
        <img
          src={family}
          alt="Family home illustration"
          className="w-full max-w-lg opacity-100"
        />
      </div>

      <div className="w-full max-w-6xl relative z-10">
        <div className="max-w-xl">
          <h1 className="text-5xl md:text-6xl font-instru tracking-tight leading-tight mb-4 text-sec-900">
            Join Your Family's Home
          </h1>
          <p className="text-lg font-inter tracking-tight text-sec-700 mb-8">
            Already part of a home? Enter the HomeId provided by the owner to
            join your family's home.
          </p>

          <form onSubmit={handleJoinHome} className="space-y-8">
            <div>
              <Label
                htmlFor="homeCode"
                className="text-xl mb-4 block font-inter tracking-tight font-medium"
              >
                Enter your HomeId
              </Label>
              <div className="relative inline-block w-lg">
                <div className="absolute inset-0 translate-x-1 translate-y-1 bg-sec-900 rounded-md pointer-events-none"></div>
                <Input
                  id="homeCode"
                  type="text"
                  placeholder="Ex. 1H342BB"
                  value={homeCode}
                  onChange={(e) => setHomeCode(e.target.value)}
                  className="relative z-10 h-12 text-base font-inter border-2 bg-prim-100 border-gray-800 rounded-md"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="flex gap-4 w-lg">
              <button
                type="button"
                onClick={() => navigate("/onboarding")}
                className="text-lg pr-8 pl-8 h-12 flex justify-center items-center font-inter border-2 border-sec-600 bg-prim-100 text-sec-600 rounded-md cursor-pointer"
              >
                <IoArrowBackOutline className="mr-2" />
                Back
              </button>

              <button
                type="submit"
                disabled={loading}
                className="flex-1 h-12 bg-sec-600 hover:bg-sec-700 font-inter tracking-tight text-white rounded-md text-xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Joining..." : "Continue"}
              </button>
            </div>

            <p className="text-sm font-inter text-sec-700">
              Not yet registered?{" "}
              <button
                type="button"
                onClick={() => navigate("/onboarding/create-home")}
                className="text-sec-600 underline hover:text-sec-700 font-medium"
              >
                Create Household
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
