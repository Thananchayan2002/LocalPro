import { authFetch } from "../../../utils/authFetch";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

/**
 * Auth API Service
 * Handles all authentication-related API calls
 */

/**
 * Get current authenticated user
 */
export const getCurrentUser = async () => {
  // Use silent401 to prevent redirect loop on initial load/auth checks
  const response = await authFetch(
    `${API_BASE_URL}/api/auth/me`,
    {},
    { silent401: true }
  );
  if (!response.ok) {
    throw new Error("Failed to fetch user data");
  }
  return response.json();
};

/**
 * Register new user
 */
export const register = async (userData) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Registration failed");
  }

  return response.json();
};

/**
 * Login user
 */
export const login = async (credentials) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Login failed");
  }

  return response.json();
};

/**
 * Logout user
 */
export const logout = async () => {
  const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Logout failed");
  }

  return response.json();
};

/**
 * Get user by phone number
 */
export const getUserByPhone = async (phone) => {
  const response = await authFetch(
    `${API_BASE_URL}/api/auth/user/phone/${phone}`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch user by phone");
  }
  return response.json();
};

/**
 * Get user by phone number (public endpoint - no authentication required)
 */
export const getPublicUserByPhone = async (phone) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/auth/public/user-by-phone/${phone}`
    );
    if (!response.ok) {
      return { success: false, data: null };
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching public user by phone:", error);
    return { success: false, data: null };
  }
};
