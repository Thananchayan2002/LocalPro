import { API_BASE_URL } from "./api";

/**
 * Admin Authentication API
 * Separate API endpoints for admin authentication
 */

/**
 * Admin login
 * @param {string} phone - Admin phone number
 * @param {string} password - Admin password
 * @returns {Promise<{success: boolean, message: string, user: Object, token: string}>}
 */
export const adminLogin = async (phone, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Send cookies
      body: JSON.stringify({ phone, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || "Login failed",
      };
    }

    return {
      success: true,
      message: data.message || "Login successful",
      user: data.user || null,
      token: data.token || null,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || "An error occurred during login",
    };
  }
};

/**
 * Admin logout
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const adminLogout = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    const data = await response.json();

    return {
      success: response.ok,
      message: data.message || "Logout successful",
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || "An error occurred during logout",
    };
  }
};

/**
 * Check admin authentication status
 * @returns {Promise<{success: boolean, user: Object|null}>}
 */
export const checkAdminAuth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/auth/me`, {
      credentials: "include",
    });

    const data = await response.json();

    if (response.ok && data.success) {
      return {
        success: true,
        user: data.user || null,
      };
    }

    return {
      success: false,
      user: null,
    };
  } catch (error) {
    console.error("Auth check failed:", error);
    return {
      success: false,
      user: null,
    };
  }
};

/**
 * Refresh admin access token
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const refreshAdminToken = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    const data = await response.json();

    return {
      success: response.ok,
      message: data.message || "Token refreshed",
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || "Token refresh failed",
    };
  }
};

/**
 * Update admin profile
 * @param {Object} profileData - Profile data to update
 * @returns {Promise<{success: boolean, message: string, user: Object|null}>}
 */
export const updateAdminProfile = async (profileData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/auth/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(profileData),
    });

    const data = await response.json();

    return {
      success: response.ok,
      message: data.message || "Profile updated",
      user: data.user || null,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || "Profile update failed",
      user: null,
    };
  }
};

export default {
  adminLogin,
  adminLogout,
  checkAdminAuth,
  refreshAdminToken,
  updateAdminProfile,
};
