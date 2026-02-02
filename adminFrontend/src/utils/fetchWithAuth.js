import { API_BASE_URL } from "./api";
import toast from "react-hot-toast";

// Track if we're already redirecting to prevent multiple redirects
let isRedirecting = false;

/**
 * Helper function to make authenticated API calls using HttpOnly cookies
 * No localStorage token needed - fully secure cookie-based auth
 */
export const fetchWithAuth = async (url, options = {}) => {
  const makeRequest = () => {
    const headers = { ...options.headers };
    
    // Only set Content-Type if not FormData
    // FormData body requires browser to set Content-Type with boundary
    if (!(options.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }
    
    return fetch(url, {
      ...options,
      credentials: "include", // Always send HttpOnly cookies
      headers,
    });
  };

  let response = await makeRequest();

  // If token expired (401), try to refresh automatically
  if (response.status === 401) {
    const refreshResponse = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });

    if (refreshResponse.ok) {
      // Retry original request with new token
      response = await makeRequest();
    } else {
      // Refresh failed - only show toast and redirect if not already redirecting
      if (!isRedirecting) {
        isRedirecting = true;

        toast.error("Your session has expired. Please login again.", {
          duration: 4000,
          position: "top-right",
        });

        // Clear any stored auth state
        localStorage.clear();
        sessionStorage.clear();

        // Redirect to login after a short delay to show the toast
        setTimeout(() => {
          window.location.href = "/login";
        }, 1000);
      }

      throw new Error("Session expired. Please login again.");
    }
  }

  return response;
};

export default fetchWithAuth;
