import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Landing from "./pages/onboarding/Landing";
import useAuth from "./hooks/useAuthHook";
import Home from "./pages/Home";
const PrivateRoute = ({ children }) => {
  const { userInfo, loading } = useAuth();

  if (loading) {
    return (
      <p className="text-neu-800 font-instru text-center mt-10">Loading...</p>
    );
  }
  const isAuthenticated = !!userInfo;
  return isAuthenticated ? children : <Navigate to="/" />;
};

const AuthRoute = ({ children }) => {
  const { userInfo, loading } = useAuth();

  if (loading) {
    return (
      <p className="text-neu-800 font-instru text-center mt-10">Loading...</p>
    );
  }
  const isAuthenticated = !!userInfo;
  return !isAuthenticated ? children : <Navigate to="/home" />;
};
const App = () => {
  return (
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
        path="/home"
        element={
          <PrivateRoute>
            <Home />
          </PrivateRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default App;
