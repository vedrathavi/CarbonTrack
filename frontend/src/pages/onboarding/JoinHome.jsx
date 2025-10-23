import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import apiClient from "@/lib/apiClient";
import { JOIN_HOME_ROUTE } from "@/utils/constants";
import useAppStore from "@/stores/useAppStore";

export default function JoinHome() {
  const navigate = useNavigate();
  const { fetchUser, logout } = useAppStore();
  const [homeCode, setHomeCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [homeDetails, setHomeDetails] = useState(null);

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
        setHomeDetails(response.data.data.home);

        // Fetch updated user info to get the householdId
        await fetchUser();

        setShowSuccessModal(true);
        toast.success("Successfully joined home!");
      }
    } catch (error) {
      const message =
        error.response?.data?.message || "Invalid home code. Please try again.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    navigate("/home");
  };

  return (
    <div className="min-h-screen bg-[#E8EFD3] flex items-center justify-center p-4 relative">
      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="absolute top-6 right-6 px-4 py-2 text-sm font-medium text-gray-700 bg-white border-2 border-gray-800 rounded-md hover:bg-gray-50 transition-colors"
      >
        Logout
      </button>

      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center">
        <div className="order-2 md:order-1">
          <div className="max-w-md">
            <h1 className="text-4xl md:text-5xl font-serif mb-4 text-gray-800">
              Join Your Family's Household
            </h1>
            <p className="text-base text-gray-700 mb-6">
              Already part of a household? Enter the household ID provided by
              the owner to join your family's home.
            </p>

            <form onSubmit={handleJoinHome} className="space-y-6">
              <div>
                <Label htmlFor="homeCode" className="text-base mb-2 block">
                  Enter your House ID
                </Label>
                <Input
                  id="homeCode"
                  type="text"
                  placeholder="Ex. 1H342BB"
                  value={homeCode}
                  onChange={(e) => setHomeCode(e.target.value)}
                  className="h-12 text-base border-2 border-gray-800 rounded-md"
                  disabled={loading}
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-48 h-12 bg-[#4A6741] hover:bg-[#3E5636] text-white rounded-md"
              >
                {loading ? "Joining..." : "Continue →"}
              </Button>

              <p className="text-sm text-gray-600">
                Not yet registered?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/onboarding/create-home")}
                  className="text-[#4A6741] underline hover:text-[#3E5636]"
                >
                  Create Household
                </button>
              </p>
            </form>
          </div>
        </div>

        <div className="order-1 md:order-2 flex justify-center">
          <img
            src="/family-home.svg"
            alt="Family home illustration"
            className="w-full max-w-md"
          />
        </div>
      </div>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="bg-[#E8EFD3] border-2 border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-2xl font-serif text-gray-800">
              Successfully Joined!
            </DialogTitle>
            <DialogDescription className="text-gray-700 space-y-4 pt-4">
              <p>You've successfully joined the household.</p>
              {homeDetails && (
                <div className="bg-white p-4 rounded-lg border border-gray-300 text-left space-y-2">
                  <p>
                    <strong>Home Code:</strong> {homeDetails.homeCode}
                  </p>
                  <p>
                    <strong>Location:</strong> {homeDetails.address?.city},{" "}
                    {homeDetails.address?.state}, {homeDetails.address?.country}
                  </p>
                  <p>
                    <strong>Total Rooms:</strong> {homeDetails.totalRooms}
                  </p>
                  <p>
                    <strong>Members:</strong> {homeDetails.members?.length}
                  </p>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end pt-4">
            <Button
              onClick={handleSuccessClose}
              className="bg-[#4A6741] hover:bg-[#3E5636] text-white"
            >
              Go to Home
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
