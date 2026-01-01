import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || 'null') : null;

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Redirect professionals to their worker dashboard
  if (user?.role === 'professional') {
    return <Navigate to="/worker/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
