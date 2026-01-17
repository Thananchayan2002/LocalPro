import { authFetch } from "../../../utils/authFetch";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

/**
 * Service API Service
 * Handles all service-related API calls
 */

/**
 * Get all services
 */
export const getAllServices = async () => {
  const response = await authFetch(`${API_BASE_URL}/api/services`);
  if (!response.ok) {
    throw new Error("Failed to fetch services");
  }
  const data = await response.json();
  return data.data || data;
};

/**
 * Get service by ID
 */
export const getServiceById = async (serviceId) => {
  const response = await authFetch(`${API_BASE_URL}/api/services/${serviceId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch service");
  }
  const data = await response.json();
  return data.data || data;
};

/**
 * Get issues by service ID
 */
export const getIssuesByServiceId = async (serviceId, limit = 1000) => {
  const response = await authFetch(
    `${API_BASE_URL}/api/issues?serviceId=${serviceId}&limit=${limit}`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch issues");
  }
  const data = await response.json();
  return data.data || data;
};

/**
 * Get popular services
 */
export const getPopularServices = async () => {
  const response = await authFetch(`${API_BASE_URL}/api/services/popular`);
  if (!response.ok) {
    throw new Error("Failed to fetch popular services");
  }
  const data = await response.json();
  return data.data || data;
};

/**
 * Search services
 */
export const searchServices = async (query) => {
  const response = await authFetch(
    `${API_BASE_URL}/api/services/search?q=${encodeURIComponent(query)}`
  );
  if (!response.ok) {
    throw new Error("Failed to search services");
  }
  const data = await response.json();
  return data.data || data;
};
