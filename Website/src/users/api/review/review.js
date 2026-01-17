import { authFetch } from "../../../utils/authFetch";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

/**
 * Review API Service
 * Handles all review-related API calls
 */

/**
 * Submit a review for a professional
 */
export const submitReview = async (reviewData) => {
  const response = await authFetch(`${API_BASE_URL}/api/reviews/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(reviewData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to submit review");
  }

  return response.json();
};

/**
 * Check if user can review a booking
 */
export const canReviewBooking = async (bookingId) => {
  const response = await authFetch(
    `${API_BASE_URL}/api/reviews/can-review/${bookingId}`
  );
  if (!response.ok) {
    throw new Error("Failed to check review eligibility");
  }
  const data = await response.json();
  return data.canReview || false;
};

/**
 * Get reviews for a professional by user ID
 */
export const getReviewsByProfessional = async (userId) => {
  const response = await authFetch(
    `${API_BASE_URL}/api/reviews/professional/${userId}`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch professional reviews");
  }
  const data = await response.json();
  return data.data || data;
};

/**
 * Get reviews for a service
 */
export const getReviewsByService = async (serviceId) => {
  const response = await authFetch(
    `${API_BASE_URL}/api/reviews/service/${serviceId}`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch service reviews");
  }
  const data = await response.json();
  return data.data || data;
};

/**
 * Update a review
 */
export const updateReview = async (reviewId, reviewData) => {
  const response = await authFetch(`${API_BASE_URL}/api/reviews/${reviewId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(reviewData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to update review");
  }

  return response.json();
};

/**
 * Delete a review
 */
export const deleteReview = async (reviewId) => {
  const response = await authFetch(`${API_BASE_URL}/api/reviews/${reviewId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to delete review");
  }

  return response.json();
};
