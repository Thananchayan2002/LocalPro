import { API_BASE_URL } from "./api";
import toast from "react-hot-toast";

// Track if we're already redirecting to prevent multiple redirects
let isRedirecting = false;

export async function authFetch(url, options = {}, config = {}) {
  const { silent401 = false, tryRefresh = true } = config;

  const request = () =>
    fetch(url, {
      ...options,
      credentials: "include",
    });
  
  const res = await request();

  // If not 401, return normally
  if (res.status !== 401) return res;

  // If we expect "not logged in", just return the 401 response
  if (silent401 || !tryRefresh) {
    return res;
  }

  // Try refresh once
  console.log("   🔄 Attempting to refresh access token...");
  const refreshRes = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
    method: "POST",
    credentials: "include",
  });

  console.log(`   ✅ Refresh response status: ${refreshRes.status}`);

  if (!refreshRes.ok) {
    console.log(`   ❌ Refresh failed with status ${refreshRes.status}`);
    const refreshJson = await refreshRes.json();
    console.log(`   📝 Refresh error message: ${refreshJson.message}`);

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

    return res;
  }

  // Retry original request
  console.log("   ✅ Refresh successful, retrying original request");
  return request();
}

export default authFetch;
