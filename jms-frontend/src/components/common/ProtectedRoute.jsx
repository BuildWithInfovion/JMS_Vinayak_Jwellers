// frontend/src/components/common/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth"; // <-- Make sure this line is updated

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    // Redirect them to the /login page, but save the current location
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
