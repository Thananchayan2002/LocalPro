import React, { createContext, useState, useContext, useEffect } from "react";
import {
  adminLogin,
  adminLogout,
  checkAdminAuth,
  refreshAdminToken,
  updateAdminProfile,
} from "../utils/adminAuthApi";

const AdminAuthContext = createContext(null);

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if admin is already logged in on mount
  useEffect(() => {
    checkAdminAuthStatus();
  }, []);

  // Auto-refresh token every 12 minutes (token expires in 15 minutes)
  useEffect(() => {
    if (!admin) return;

    const refreshInterval = setInterval(async () => {
      try {
        await refreshAdminToken();
      } catch (err) {
        console.error("Auto token refresh failed:", err);
      }
    }, 12 * 60 * 1000); // 12 minutes

    return () => clearInterval(refreshInterval);
  }, [admin]);

  const checkAdminAuthStatus = async () => {
    try {
      const result = await checkAdminAuth();
      if (result.success && result.user) {
        setAdmin(result.user);
      }
    } catch (err) {
      console.error("Admin auth check failed:", err);
    } finally {
      setLoading(false);
    }
  };

  // Admin login
  const login = async (phone, password) => {
    try {
      setError(null);
      setLoading(true);

      const result = await adminLogin(phone, password);

      if (result.success) {
        setAdmin(result.user);
        // Set localStorage flag for first-login reload
        localStorage.setItem("adminNeedsFirstLoginRefresh", "true");
      } else {
        setError(result.message);
      }

      return result;
    } catch (err) {
      const errorMsg = "Login failed. Please try again.";
      setError(errorMsg);
      return {
        success: false,
        message: errorMsg,
      };
    } finally {
      setLoading(false);
    }
  };

  // Admin logout
  const logout = async () => {
    try {
      setError(null);
      setLoading(true);

      const result = await adminLogout();

      if (result.success) {
        setAdmin(null);
        localStorage.removeItem("adminNeedsFirstLoginRefresh");
      } else {
        setError(result.message);
      }

      return result;
    } catch (err) {
      const errorMsg = "Logout failed. Please try again.";
      setError(errorMsg);
      return {
        success: false,
        message: errorMsg,
      };
    } finally {
      setLoading(false);
    }
  };

  // Update admin profile
  const updateProfile = async (profileData) => {
    try {
      setError(null);
      setLoading(true);

      const result = await updateAdminProfile(profileData);

      if (result.success && result.user) {
        setAdmin(result.user);
      } else {
        setError(result.message);
      }

      return result;
    } catch (err) {
      const errorMsg = "Profile update failed. Please try again.";
      setError(errorMsg);
      return {
        success: false,
        message: errorMsg,
      };
    } finally {
      setLoading(false);
    }
  };

  // Refresh admin token
  const refreshToken = async () => {
    try {
      const result = await refreshAdminToken();
      if (!result.success) {
        setError(result.message);
        // If refresh fails, logout the admin
        setAdmin(null);
      }
      return result;
    } catch (err) {
      const errorMsg = "Token refresh failed";
      setError(errorMsg);
      // If refresh fails, logout the admin
      setAdmin(null);
      return {
        success: false,
        message: errorMsg,
      };
    }
  };

  const value = {
    admin,
    loading,
    error,
    login,
    logout,
    updateProfile,
    refreshToken,
    checkAdminAuthStatus,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};

/**
 * Hook to use admin authentication context
 */
export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);

  if (!context) {
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  }

  return context;
};

export default AdminAuthContext;
