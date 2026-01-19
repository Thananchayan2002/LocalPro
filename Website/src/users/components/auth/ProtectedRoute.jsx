import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../../worker/context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect professionals to their worker dashboard
  if (user?.role === "professional") {
    return <Navigate to="/worker/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
