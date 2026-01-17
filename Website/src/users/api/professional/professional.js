import { authFetch } from "../../../utils/authFetch";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

/**
 * Professional API Service
 * Handles all professional-related API calls
 */

/**
 * Get all professionals
 */
export const getAllProfessionals = async (params = {}) => {
  const { status = "accepted", limit = 1000 } = params;
  const response = await authFetch(
    `${API_BASE_URL}/api/professionals?status=${status}&limit=${limit}`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch professionals");
  }
  const data = await response.json();
  return data.data || data;
};

/**
 * Get professional by ID
 */
export const getProfessionalById = async (professionalId) => {
  const response = await authFetch(
    `${API_BASE_URL}/api/professionals/${professionalId}`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch professional");
  }
  const data = await response.json();
  return data.data || data;
};

/**
 * Register as professional
 */
export const registerProfessional = async (professionalData) => {
  const response = await authFetch(`${API_BASE_URL}/api/professionals`, {
    method: "POST",
    body: professionalData, // FormData for file uploads
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to register as professional");
  }

  return response.json();
};

/**
 * Update professional profile
 */
export const updateProfessional = async (professionalId, professionalData) => {
  const response = await authFetch(
    `${API_BASE_URL}/api/professionals/${professionalId}`,
    {
      method: "PUT",
      body: professionalData, // FormData for file uploads
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to update professional profile");
  }

  return response.json();
};

/**
 * Get professionals by service
 */
export const getProfessionalsByService = async (serviceId) => {
  const response = await authFetch(
    `${API_BASE_URL}/api/professionals/service/${serviceId}`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch professionals by service");
  }
  const data = await response.json();
  return data.data || data;
};

/**
 * Get professional's profile image URL
 */
export const getProfessionalImageUrl = (profileImage) => {
  if (!profileImage) return null;
  if (profileImage.startsWith("http")) return profileImage;
  return `${import.meta.env.VITE_API_BASE_URL}/${profileImage}`;
};
