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

import location from "@/assets/location.svg";
import { IoArrowBackOutline, IoArrowForwardOutline } from "react-icons/io5";

// Simple in-memory cache for states per country to avoid repeat network calls
const statesCache = {};

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
  const [states, setStates] = useState([]);
  const [loadingStates, setLoadingStates] = useState(false);

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
    // fetch states for the selected country (cascade)
    if (country?.name) {
      // use cache when available
      if (statesCache[country.name]) {
        setStates(statesCache[country.name]);
      } else {
        fetchStates(country.name);
      }
    } else {
      setStates([]);
    }
  };

  const showSelectCountryHint = () => {
    if (!formData.country) {
      toast("Select a country first to enable this field");
      return;
    }

    if (loadingStates) {
      toast("States are loading, please wait...");
    }
  };

  const fetchStates = async (countryName) => {
    try {
      setLoadingStates(true);
      setStates([]);

      // Using countriesnow.space API to fetch states for a given country name
      const resp = await fetch(
        "https://countriesnow.space/api/v0.1/countries/states",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ country: countryName }),
        }
      );

      if (!resp.ok) throw new Error(`Failed to fetch states: ${resp.status}`);

      const json = await resp.json();

      // Different APIs sometimes nest the states differently; be defensive
      const rawStates = json?.data?.states ?? json?.states ?? json?.data ?? [];

      const stateList = Array.isArray(rawStates)
        ? rawStates
            .map((s) => (s?.name ? s.name : s))
            .filter(Boolean)
            .sort((a, b) => a.localeCompare(b))
        : [];

      setStates(stateList);
      // cache the result for this country
      // cache the result for this country
      statesCache[countryName] = stateList;
    } catch (err) {
      console.error("Error fetching states:", err);
      toast.error("Failed to load states for selected country");
      setStates([]);
    } finally {
      setLoadingStates(false);
    }
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
    <div className="min-h-screen bg-prim-100 flex flex-col relative ">
      {/* Logout Button */}
      <div className="absolute top-6 right-6 z-50 ">
        <div className="btn-3d-wrapper">
          <div className="btn-3d-offset" aria-hidden />
          <button onClick={handleLogout} className="btn-3d btn-3d--primary">
            <span className="text-md text-prim-100 font-inter font-medium">
              Log Out
            </span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-start justify-start p-8 pt-24 pb-32 mb-10 relative z-10">
        <div className="w-full max-w-4xl">
          <h1 className="text-5xl md:text-6xl font-instru tracking-tight leading-tight mb-4 text-sec-900">
            Where is your home located?
          </h1>
          <p className="font-inter tracking-tight text-base text-sec-700 mb-8">
            We use your region to fetch accurate emission factors.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Horizontal Layout for Location Fields */}
            <div className="flex md:flex-row flex-col w-full gap-4">
              {/* Country */}
              <div className="flex-1">
                <Label
                  htmlFor="country"
                  className="font-inter text-lg font-medium mb-2  text-sec-900"
                >
                  Country
                </Label>
                <div className="relative inline-block w-full">
                  <div className="absolute inset-0 translate-x-1 translate-y-1 bg-sec-900 rounded-md pointer-events-none"></div>
                  <Select
                    onValueChange={handleCountryChange}
                    value={
                      countries.find((c) => c.name === formData.country)?.code
                    }
                    disabled={loadingCountries}
                  >
                    <SelectTrigger className="relative z-10 w-full !h-12 font-inter border-2 border-sec-900 rounded-md bg-white">
                      <SelectValue
                        placeholder={
                          loadingCountries
                            ? "Loading countries..."
                            : "Ex. India"
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
              </div>

              {/* State/Region */}
              <div className="flex-1">
                <Label
                  htmlFor="state"
                  className="font-inter text-lg font-medium mb-2 block text-sec-900"
                >
                  State/Region
                </Label>
                <div className="relative inline-block w-full">
                  <div
                    className={`absolute inset-0 translate-x-1 translate-y-1 rounded-md pointer-events-none ${
                      loadingStates || !formData.country
                        ? "bg-sec-900"
                        : "bg-sec-900"
                    }`}
                  ></div>

                  {/* overlay to capture clicks when country not selected - shows micro engagement */}
                  {!formData.country && (
                    <div className="absolute inset-0 z-20 flex">
                      <button
                        type="button"
                        onClick={showSelectCountryHint}
                        className="w-full h-full bg-transparent"
                        aria-hidden
                      />
                    </div>
                  )}

                  {loadingStates ? (
                    <Select  value={formData.state}>
                      <SelectTrigger className={`relative z-10 w-full !h-12 font-inter border-2 border-sec-900 rounded-md bg-white `}>
                        <SelectValue placeholder="Loading states..." />
                      </SelectTrigger>
                    </Select>
                  ) : states && states.length > 0 ? (
                    <Select
                      disabled={!formData.country}
                      onValueChange={(val) =>
                        setFormData({ ...formData, state: val })
                      }
                      value={formData.state}
                    >
                      <SelectTrigger className={`relative z-10 w-full !h-12 font-inter border-2 border-sec-900 rounded-md bg-white `}>
                        <SelectValue placeholder="Select a state" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {states.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      id="state"
                      type="text"
                      placeholder="Ex. Rajasthan"
                      value={formData.state}
                      disabled={!formData.country}
                      onChange={(e) =>
                        setFormData({ ...formData, state: e.target.value })
                      }
                      className={`relative z-10 h-12 text-base font-inter border-2 border-sec-900 rounded-md bg-white ${
                        loadingStates ? "opacity-100" : !formData.country ? "opacity-100 cursor-not-allowed" : ""
                      }`}
                    />
                  )}
                </div>
              </div>

              {/* City */}
              <div className="flex-1">
                <Label
                  htmlFor="city"
                  className="font-inter text-lg font-medium mb-2 block text-sec-900"
                >
                  City
                </Label>
                <div className="relative inline-block w-full">
                  <div
                    className={`absolute inset-0 translate-x-1 translate-y-1 rounded-md pointer-events-none ${
                      !formData.country ? "bg-sec-900" : "bg-sec-900"
                    }`}
                  ></div>
                  {!formData.country && (
                    <div className="absolute inset-0 z-20 flex">
                      <button
                        type="button"
                        onClick={showSelectCountryHint}
                        className="w-full h-full bg-transparent"
                        aria-hidden
                      />
                    </div>
                  )}
                  <Input
                    id="city"
                    type="text"
                    placeholder="Ex. Jaipur"
                    value={formData.city}
                    disabled={!formData.country}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    className={`relative z-10 h-12 text-base font-inter border-2 border-sec-900 rounded-md bg-white ${
                      loadingStates ? "opacity-100" : !formData.country ? "opacity-100 cursor-not-allowed" : ""
                    }`}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate("/onboarding")}
                className="text-lg pr-16 pl-14 h-12 flex justify-center items-center font-inter border-2 border-sec-600 bg-prim-100 text-sec-600 rounded-md cursor-pointer"
              >
                <IoArrowBackOutline className="mr-2" />
                Back
              </button>
              <button
                type="submit"
                className="text-lg h-12 font-inter flex items-center justify-center pl-16 pr-14 bg-sec-600 text-prim-100 rounded-md cursor-pointer"
              >
                Next
                <IoArrowForwardOutline className="ml-2 size-5 inline-block" />
              </button>
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

      {/* Image Stuck to Bottom Right */}
      <div className="absolute bottom-0  right-0 pointer-events-none">
        <img
          src={location}
          alt="Location illustration"
          className="w-full max-w-3xl  object-contain"
        />
      </div>
    </div>
  );
}
