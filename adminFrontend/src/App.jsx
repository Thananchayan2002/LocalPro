import { useState } from "react";
import "./globals.css";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { Login } from "./components/auth/Login";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { Layout } from "./components/layout/Layout";
import { Dashboard } from "./components/dashboard/Dashboard";
import { Services } from "./components/services/Services";
import { Professionals } from "./components/professionals/Professionals";
import { Bookings } from "./components/bookings/Bookings";
import { ActiveBookings } from "./components/bookings/ActiveBookings";
import { Payments } from "./components/payments/Payments";
import { Revenue } from "./components/revenue/Revenue";
import { Notifications } from "./components/notifications/Notifications";
import { Account } from "./components/account/Account";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="services" element={<Services />} />
            <Route path="professionals" element={<Professionals />} />
            <Route path="active-bookings" element={<ActiveBookings />} />
            <Route path="bookings" element={<Bookings />} />
            <Route path="payments" element={<Payments />} />
            <Route path="revenue" element={<Revenue />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="account" element={<Account />} />
          </Route>

          {/* Catch all - redirect to dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
