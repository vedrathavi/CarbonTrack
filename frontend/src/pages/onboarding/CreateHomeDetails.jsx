import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import apiClient from "@/lib/apiClient";
import { CREATE_HOME_ROUTE } from "@/utils/constants";
import useAppStore from "@/stores/useAppStore";
import homeAppliance from "@/assets/home-appliances.svg";
import { IoArrowBackOutline } from "react-icons/io5";

const APPLIANCES_LIST = [
  { id: "airConditioner", label: "Air Conditioner" },
  { id: "refrigerator", label: "Refrigerator" },
  { id: "washingMachine", label: "Washing Machine" },
  { id: "tv", label: "Television" },
  { id: "computer", label: "Computer" },
  { id: "fan", label: "Fans" },
  { id: "lights", label: "Lights" },
  { id: "electricStove", label: "Electric Stove" },
  { id: "microwave", label: "Microwave" },
  { id: "vacuumCleaner", label: "Vaccum Cleaner" },
];

export default function CreateHomeDetails() {
  const navigate = useNavigate();
  const { fetchUser, logout, userInfo } = useAppStore();
  const [totalRooms, setTotalRooms] = useState("");
  const [selectedAppliances, setSelectedAppliances] = useState({});
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
    navigate("/");
  };

  useEffect(() => {
    // If user already has a home, redirect to home page
    if (userInfo?.householdId) {
      navigate("/dashboard");
      return;
    }

    // Check if location data exists
    const locationData = localStorage.getItem("homeLocation");
    if (!locationData) {
      toast.error("Please complete location details first");
      navigate("/onboarding/create-home");
    }
  }, [navigate, userInfo]);

  const handleApplianceToggle = (applianceId) => {
    setSelectedAppliances((prev) => {
      const newState = { ...prev };
      if (applianceId in newState) {
        // Remove the appliance completely when unchecking
        delete newState[applianceId];
      } else {
        // Add with count 1 when checking
        newState[applianceId] = 1;
      }
      return newState;
    });
  };

  const handleApplianceCount = (applianceId, value) => {
    const count = parseInt(value) || 0;
    if (count === 0) {
      // If user sets count to 0, remove the appliance
      setSelectedAppliances((prev) => {
        const newState = { ...prev };
        delete newState[applianceId];
        return newState;
      });
    } else {
      setSelectedAppliances((prev) => ({
        ...prev,
        [applianceId]: count,
      }));
    }
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
        localStorage.removeItem("homeLocation"); // Clean up

        // Fetch user info to update householdId state
        await fetchUser();

        toast.success("Home created successfully!");
        navigate("/home");
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
          src={homeAppliance}
          alt="Home details illustration"
          className="w-full max-w-lg opacity-100"
        />
      </div>

      <div className="w-full max-w-6xl relative z-10">
        <div className="order-1 md:order-1">
          <div className="max-w-lg">
            <h1 className="text-5xl md:text-6xl font-instru tracking-tight leading-tight mb-4 text-sec-900 ">
              Tell us about your home
            </h1>
            <p className="text-lg font-inter tracking-tight text-sec-700 mb-8">
              This helps us estimate your overall energy use.
            </p>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Number of Rooms */}
              <div>
                <Label
                  htmlFor="rooms"
                  className="text-xl mb-4 block font-inter tracking-tight font-medium"
                >
                  Number of Rooms
                </Label>
                <div className="relative inline-block w-full">
                  <div className="absolute inset-0 translate-x-1 translate-y-1 bg-sec-900 rounded-md pointer-events-none"></div>
                  <Input
                    id="rooms"
                    type="number"
                    min="1"
                    placeholder="Ex. 4 rooms"
                    value={totalRooms}
                    onChange={(e) => setTotalRooms(e.target.value)}
                    onKeyDown={(e) => {
                      // Prevent 'e', 'E', '+', '-', '.'
                      if (["e", "E", "+", "-", "."].includes(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    className="relative z-10 h-12 text-base font-inter border-2 bg-prim-100 border-gray-800 rounded-md"
                  />
                </div>
              </div>

              {/* Appliances */}
              <div>
                <Label className="text-xl mb-4 block font-inter tracking-tight font-medium">
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
                        className="border-full border-prim-900"
                      />
                      <label
                        htmlFor={appliance.id}
                        className="flex-1 text-md font-inter cursor-pointer"
                      >
                        {appliance.label}
                      </label>
                      {appliance.id in selectedAppliances && (
                        <div className="relative inline-block">
                          <div className="absolute inset-0 translate-x-1 translate-y-1 bg-sec-900 rounded-md pointer-events-none"></div>
                          <Input
                            type="number"
                            min="0"
                            placeholder="0"
                            value={selectedAppliances[appliance.id]}
                            onChange={(e) =>
                              handleApplianceCount(appliance.id, e.target.value)
                            }
                            className="relative z-10 w-18 h-12   font-medium text-center font-inter border-2 bg-prim-100 border-gray-800 rounded-md"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => navigate('/onboarding/create-home/location')}
                  className="text-lg pr-8 pl-8 h-12 flex justify-center items-center font-inter border-2 border-sec-600 bg-prim-100 text-sec-600 rounded-md cursor-pointer"
                >
                  <IoArrowBackOutline className="mr-2" />
                  Back
                </button>

                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 h-12 bg-sec-600 hover:bg-sec-700 font-inter tracking-tight text-white rounded-md text-xl"
                >
                  
                  {loading ? "Creating..." : "Finish"}
                </Button>
              </div>

              <p className="text-sm font-inter text-sec-700">
                Already registered?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/onboarding/join-home")}
                  className="text-sec-600 underline hover:text-sec-700 font-medium"
                >
                  Join Home
                </button>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
