import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import apiClient from "@/lib/apiClient";
import { CREATE_HOME_ROUTE } from "@/utils/constants";
import useAppStore from "@/stores/useAppStore";

const APPLIANCES_LIST = [
  { id: "airConditioner", label: "Air Conditioner" },
  { id: "refrigerator", label: "Refrigerator" },
  { id: "washingMachine", label: "Washing Machine" },
  { id: "tv", label: "TV / Computer" },
  { id: "computer", label: "Computer" },
  { id: "fan", label: "Fans" },
  { id: "lights", label: "Lights" },
  { id: "electricStove", label: "Electric Stove" },
  { id: "microwave", label: "Microwave" },
  { id: "vacuumCleaner", label: "Vaccum Cleanrer" },
];

export default function CreateHomeDetails() {
  const navigate = useNavigate();
  const { fetchUser, logout } = useAppStore();
  const [totalRooms, setTotalRooms] = useState("");
  const [selectedAppliances, setSelectedAppliances] = useState({});
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [homeDetails, setHomeDetails] = useState(null);

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
    navigate("/");
  };

  useEffect(() => {
    // Check if location data exists
    const locationData = localStorage.getItem("homeLocation");
    if (!locationData) {
      toast.error("Please complete location details first");
      navigate("/onboarding/create-home");
    }
  }, [navigate]);

  const handleApplianceToggle = (applianceId) => {
    setSelectedAppliances((prev) => {
      const newState = { ...prev };
      if (newState[applianceId]) {
        delete newState[applianceId];
      } else {
        newState[applianceId] = 0;
      }
      return newState;
    });
  };

  const handleApplianceCount = (applianceId, value) => {
    const count = parseInt(value) || 0;
    setSelectedAppliances((prev) => ({
      ...prev,
      [applianceId]: count,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!totalRooms || totalRooms < 1) {
      toast.error("Please enter at least 1 room");
      return;
    }

    // Check if at least one appliance is selected
    const hasAppliances = Object.values(selectedAppliances).some(
      (count) => count > 0
    );
    if (!hasAppliances) {
      toast.error("Please select at least one appliance");
      return;
    }

    const locationData = JSON.parse(localStorage.getItem("homeLocation"));

    // Prepare appliances object with all appliances (0 for unselected)
    const appliances = {
      airConditioner: selectedAppliances.airConditioner || 0,
      refrigerator: selectedAppliances.refrigerator || 0,
      washingMachine: selectedAppliances.washingMachine || 0,
      tv: selectedAppliances.tv || 0,
      computer: selectedAppliances.computer || 0,
      fan: selectedAppliances.fan || 0,
      lights: selectedAppliances.lights || 0,
      vacuumCleaner: selectedAppliances.vacuumCleaner || 0,
      electricStove: 0,
      microwave: 0,
    };

    const payload = {
      address: {
        country: locationData.countryCode || locationData.country, // Use code for API, fallback to name
        state: locationData.state,
        city: locationData.city,
      },
      totalRooms: parseInt(totalRooms),
      appliances,
    };

    console.log("Creating home with payload:", payload);
    console.log("Country code being sent:", locationData.countryCode);
    console.log("Country name:", locationData.country);

    setLoading(true);
    try {
      const response = await apiClient.post(CREATE_HOME_ROUTE, payload);

      if (response.data.status === "success") {
        setHomeDetails(response.data.data.home);
        localStorage.removeItem("homeLocation"); // Clean up

        // Fetch updated user info to get the householdId
        await fetchUser();

        setShowSuccessModal(true);
        toast.success("Home created successfully!");
      }
    } catch (error) {
      console.error("Error creating home:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      console.error(
        "Full error object:",
        JSON.stringify(error.response?.data, null, 2)
      );

      // If emission factor error, show specific message
      if (error.response?.data?.code === "EMISSION_FACTOR_UNAVAILABLE") {
        toast.error(
          `Unable to fetch emission data for ${locationData.country}. The Climatiq API may not support this country yet. Please contact support or try again later.`,
          { duration: 5000 }
        );
      } else {
        const message =
          error.response?.data?.message ||
          "Failed to create home. Please try again.";
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    navigate("/home");
  };

  return (
    <div className="min-h-screen bg-[#E8EFD3] flex items-center justify-center p-4 py-12 relative">
      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="absolute top-6 right-6 px-4 py-2 text-sm font-medium text-gray-700 bg-white border-2 border-gray-800 rounded-md hover:bg-gray-50 transition-colors z-50"
      >
        Logout
      </button>

      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 items-start">
        <div className="order-2 md:order-1">
          <div className="max-w-md">
            <h1 className="text-4xl md:text-5xl font-instru tracking-tight mb-4 text-gray-800">
              Tell us about your home
            </h1>
            <p className="text-base text-gray-700 mb-8">
              This helps us estimate your overall energy use.
            </p>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Number of Rooms */}
              <div>
                <Label
                  htmlFor="rooms"
                  className="text-lg mb-3 block font-medium"
                >
                  Number of Rooms
                </Label>
                <Input
                  id="rooms"
                  type="number"
                  min="1"
                  placeholder="Ex. 4 rooms"
                  value={totalRooms}
                  onChange={(e) => setTotalRooms(e.target.value)}
                  className="h-12 text-base border-2 border-gray-800 rounded-md"
                />
              </div>

              {/* Appliances */}
              <div>
                <Label className="text-lg mb-4 block font-medium">
                  What Appliances do you use?
                </Label>
                <div className="space-y-3">
                  {APPLIANCES_LIST.map((appliance) => (
                    <div key={appliance.id} className="flex items-center gap-3">
                      <Checkbox
                        id={appliance.id}
                        checked={appliance.id in selectedAppliances}
                        onCheckedChange={() =>
                          handleApplianceToggle(appliance.id)
                        }
                        className="border-2 border-gray-800"
                      />
                      <label
                        htmlFor={appliance.id}
                        className="flex-1 text-base cursor-pointer"
                      >
                        {appliance.label}
                      </label>
                      {appliance.id in selectedAppliances && (
                        <Input
                          type="number"
                          min="0"
                          placeholder="0"
                          value={selectedAppliances[appliance.id]}
                          onChange={(e) =>
                            handleApplianceCount(appliance.id, e.target.value)
                          }
                          className="w-20 h-9 text-center border-2 border-gray-800 rounded-md"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-[#4A6741] hover:bg-[#3E5636] text-white rounded-md text-lg"
              >
                {loading ? "Creating..." : "Next →"}
              </Button>
            </form>
          </div>
        </div>

        <div className="order-1 md:order-2 flex justify-center items-start sticky top-8">
          <img
            src="/home-details.svg"
            alt="Home details illustration"
            className="w-full max-w-md"
          />
        </div>
      </div>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="bg-[#E8EFD3] border-2 border-gray-800 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-3xl font-serif text-gray-800 text-center mb-2">
              Profile Created Successfully!
            </DialogTitle>
            <DialogDescription className="text-gray-700 space-y-4 pt-4">
              {homeDetails && (
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-lg border-2 border-gray-800 text-center">
                    <p className="text-2xl font-bold text-[#4A6741] mb-1">
                      {homeDetails.homeCode}
                    </p>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(homeDetails.homeCode);
                        toast.success("Home code copied to clipboard!");
                      }}
                      className="text-sm text-gray-600 hover:text-gray-800 flex items-center justify-center gap-1 mx-auto"
                    >
                      <span>📋</span> Copy Code
                    </button>
                  </div>
                  <p className="text-center text-base">
                    Your details are saved, and your journey towards a greener
                    lifestyle begins now.
                  </p>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center pt-4">
            <Button
              onClick={handleSuccessClose}
              className="w-full bg-[#4A6741] hover:bg-[#3E5636] text-white"
            >
              Go to Home
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
