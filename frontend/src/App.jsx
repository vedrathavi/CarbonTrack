import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";

import Landing from "./pages/onboarding/Landing";
import useAuth from "./hooks/useAuthHook";
import HomeSelection from "./pages/onboarding/HomeSelection";
import JoinHome from "./pages/onboarding/JoinHome";
import CreateHomeLocation from "./pages/onboarding/CreateHomeLocation";
import CreateHomeDetails from "./pages/onboarding/CreateHomeDetails";
import DashboardLayout from "@/components/Dashboard/Layout";
import DashboardSection from "./pages/dashboard/sections/DashboardSection";
import EducationSection from "./pages/dashboard/sections/EducationSection";
import InsightsSection from "./pages/dashboard/sections/Option3Section";
import Profile from "./pages/dashboard/Profile";
import Loading from "./pages/Loading";
const PrivateRoute = ({ children }) => {
  const { userInfo, loading } = useAuth();

  if (loading) {
    return (
      <p className="text-neu-800 font-instru text-center mt-10">Loading...</p>
    );
  }

  const isAuthenticated = !!userInfo;
  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  // Check if user has completed onboarding (has a home)
  const hasHome = !!userInfo.householdId;
  const isOnboardingPage = window.location.pathname.startsWith("/onboarding");
  const isCreateHomeDetailsPage =
    window.location.pathname === "/onboarding/create-home/details";

  // If no home and not on onboarding page, redirect to onboarding
  if (!hasHome && !isOnboardingPage) {
    return <Navigate to="/onboarding" />;
  }

  // If has home and on onboarding page, redirect to dashboard
  // EXCEPT if on create-home/details page (user might be viewing success modal)
  if (hasHome && isOnboardingPage && !isCreateHomeDetailsPage) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

const AuthRoute = ({ children }) => {
  const { userInfo, loading } = useAuth();

  if (loading) {
    return (
      <p className="text-neu-800 font-instru text-center mt-10">Loading...</p>
    );
  }

  const isAuthenticated = !!userInfo;

  if (!isAuthenticated) {
    return children;
  }

  // If authenticated, check if user has a home
  const hasHome = !!userInfo.householdId;
  return hasHome ? <Navigate to="/dashboard" /> : <Navigate to="/onboarding" />;
};
const App = () => {
  return (
    <>
      <Toaster position="top-center" theme="light" />
      <Routes>
        <Route
          path="/"
          element={
            <AuthRoute>
              <Landing />
            </AuthRoute>
          }
        />
        <Route
          path="/onboarding"
          element={
            <PrivateRoute>
              <HomeSelection />
            </PrivateRoute>
          }
        />
        <Route
          path="/onboarding/join-home"
          element={
            <PrivateRoute>
              <JoinHome />
            </PrivateRoute>
          }
        />
        <Route
          path="/onboarding/create-home"
          element={
            <PrivateRoute>
              <CreateHomeLocation />
            </PrivateRoute>
          }
        />
        <Route
          path="/onboarding/create-home/details"
          element={
            <PrivateRoute>
              <CreateHomeDetails />
            </PrivateRoute>
          }
        />
        {/* Dashboard routes (top-level paths rendered inside DashboardLayout) */}
        <Route
          element={
            <PrivateRoute>
              <DashboardLayout />
            </PrivateRoute>
          }
        >
          <Route path="dashboard" element={<DashboardSection />} />
          <Route path="education" element={<EducationSection />} />
          <Route path="insights" element={<InsightsSection />} />

          <Route path="profile" element={<Profile />} />
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
};

export default App;
