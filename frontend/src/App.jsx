import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";

import Landing from "./pages/onboarding/Landing";
import useAuth from "./hooks/useAuthHook";
import Home from "./pages/Home";
import HomeSelection from "./pages/onboarding/HomeSelection";
import JoinHome from "./pages/onboarding/JoinHome";
import CreateHomeLocation from "./pages/onboarding/CreateHomeLocation";
import CreateHomeDetails from "./pages/onboarding/CreateHomeDetails";
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

  // If no home and not on onboarding page, redirect to onboarding
  if (!hasHome && !isOnboardingPage) {
    return <Navigate to="/onboarding" />;
  }

  // If has home and on onboarding page, redirect to home
  if (hasHome && isOnboardingPage) {
    return <Navigate to="/home" />;
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
  return hasHome ? <Navigate to="/home" /> : <Navigate to="/onboarding" />;
};
const App = () => {
  return (
    <>
      <Toaster position="top-center" richColors />
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
        <Route
          path="/home"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
};

export default App;
