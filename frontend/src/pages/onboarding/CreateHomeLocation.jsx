import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import useAppStore from "@/stores/useAppStore";

export default function CreateHomeLocation() {
  const navigate = useNavigate();
  const { logout } = useAppStore();
  const [formData, setFormData] = useState({
    country: "",
    countryCode: "", // Store the 2-letter code for API
    state: "",
    city: "",
  });
  const [countries, setCountries] = useState([]);
  const [loadingCountries, setLoadingCountries] = useState(true);

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
    navigate("/");
  };

  // Fetch countries on mount
  useEffect(() => {
    fetchCountries();
  }, []);

  const fetchCountries = async () => {
    try {
      setLoadingCountries(true);
      console.log("Fetching countries...");

      // Try the fields parameter to get only what we need
      const response = await fetch(
        "https://restcountries.com/v3.1/all?fields=name,cca2"
      );
      console.log("Response status:", response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Fetched countries:", data.length);
      console.log("Sample country:", data[0]);

      const countryList = data
        .map((country) => ({
          name: country.name.common,
          code: country.cca2,
        }))
        .sort((a, b) => a.name.localeCompare(b.name));

      console.log("Processed country list:", countryList.length);
      setCountries(countryList);
    } catch (error) {
      console.error("Error fetching countries:", error);
      toast.error("Failed to load countries. Please try again.");
    } finally {
      setLoadingCountries(false);
    }
  };
  const handleCountryChange = (value) => {
    const country = countries.find((c) => c.code === value);
    setFormData({
      country: country.name,
      countryCode: country.code, // Store the 2-letter code
      state: "",
      city: "",
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.country || !formData.state || !formData.city) {
      toast.error("Please fill in all location fields");
      return;
    }

    // Store location data and move to next step
    localStorage.setItem("homeLocation", JSON.stringify(formData));
    navigate("/onboarding/create-home/details");
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
              Where is your household located?
            </h1>
            <p className="text-base text-gray-700 mb-8">
              We use your region to fetch accurate emission factors.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Country */}
              <div>
                <Label htmlFor="country" className="text-base mb-2 block">
                  Country
                </Label>
                <Select
                  onValueChange={handleCountryChange}
                  value={
                    countries.find((c) => c.name === formData.country)?.code
                  }
                  disabled={loadingCountries}
                >
                  <SelectTrigger className="h-12 border-2 border-gray-800 rounded-md">
                    <SelectValue
                      placeholder={
                        loadingCountries ? "Loading countries..." : "Ex. India"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {countries.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* State/Region */}
              <div>
                <Label htmlFor="state" className="text-base mb-2 block">
                  State/Region
                </Label>
                <Input
                  id="state"
                  type="text"
                  placeholder="Ex. Rajasthan"
                  value={formData.state}
                  onChange={(e) =>
                    setFormData({ ...formData, state: e.target.value })
                  }
                  className="h-12 text-base border-2 border-gray-800 rounded-md"
                />
              </div>

              {/* City */}
              <div>
                <Label htmlFor="city" className="text-base mb-2 block">
                  City
                </Label>
                <Input
                  id="city"
                  type="text"
                  placeholder="Ex. Jaipur"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  className="h-12 text-base border-2 border-gray-800 rounded-md"
                />
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  onClick={() => navigate("/onboarding")}
                  variant="outline"
                  className="w-32 h-12 border-2 border-gray-800 bg-[#B8D4BE] hover:bg-[#A5C4AB] text-gray-800 rounded-md"
                >
                  ← Back
                </Button>
                <Button
                  type="submit"
                  className="flex-1 h-12 bg-[#4A6741] hover:bg-[#3E5636] text-white rounded-md"
                >
                  Finish
                </Button>
              </div>
            </form>
          </div>
        </div>

        <div className="order-1 md:order-2 flex justify-center">
          <img
            src="/location-illustration.svg"
            alt="Location illustration"
            className="w-full max-w-md"
          />
        </div>
      </div>
    </div>
  );
}
