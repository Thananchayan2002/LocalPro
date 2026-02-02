import React, { createContext, useState, useContext, useEffect } from "react";
import { authFetch } from "../../utils/authFetch";
import { API_BASE_URL } from "../../utils/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in on mount
  useEffect(() => {
    const loadSession = async () => {
      try {
       
        // Use silent401 to prevent redirect loop on initial load
        const res = await authFetch(
          `${API_BASE_URL}/api/auth/me`,
          {},
          { silent401: true }
        );
        if (!res.ok) {
          setUser(null);
          return;
        }
        const data = await res.json();
        setUser(data.user || null);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, []);

  // Set auth data (used by Login component)
  const setAuthData = (user) => {
    setUser(user);
    // Set flag for first login refresh
    localStorage.setItem("needsFirstLoginRefresh", "true");
  };

  // Logout function
  const logout = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      // Silent logout failure (client-side state still cleared)
    }
    setUser(null);
    // Clear first login flag on logout
    localStorage.removeItem("needsFirstLoginRefresh");
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!user;
  };

  const value = {
    user,
    logout,
    isAuthenticated,
    loading,
    setAuthData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
