import { authFetch } from "./authFetch";
import axios from "axios";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

// Configure axios to send cookies with every request
axios.defaults.withCredentials = true;
axios.defaults.baseURL = API_BASE_URL;

export async function fetchMyActivities({ limit = 20, page = 1 } = {}) {
  const res = await authFetch(
    `${API_BASE_URL}/api/activities?limit=${limit}&page=${page}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || "Failed to load activities");
  }
  return data.data || [];
}

// Get curated popular services: trending === true or first 5 fallback
export async function fetchPopularServices() {
  const res = await authFetch(`${API_BASE_URL}/api/services/popular`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = await res.json();
  if (!res.ok || !data.success || !Array.isArray(data.data)) {
    throw new Error(data.message || "Failed to load services");
  }
  return data.data;
}
