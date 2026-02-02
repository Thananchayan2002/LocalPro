import { authFetch } from "../../../utils/authFetch";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

/**
 * Booking API Service
 * Handles all booking-related API calls
 */

/**
 * Create a new booking
 */
export const createBooking = async (bookingData) => {
  const response = await authFetch(`${API_BASE_URL}/api/bookings/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(bookingData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to create booking");
  }

  return response.json();
};

/**
 * Get user's bookings
 */
export const getMyBookings = async () => {
  const response = await authFetch(`${API_BASE_URL}/api/bookings/my-bookings`);
  if (!response.ok) {
    throw new Error("Failed to fetch bookings");
  }
  const data = await response.json();
  return data.bookings || data.data || data;
};

/**
 * Get booking by ID
 */
export const getBookingById = async (bookingId) => {
  const response = await authFetch(`${API_BASE_URL}/api/bookings/${bookingId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch booking");
  }
  const data = await response.json();
  return data.data || data;
};

/**
 * Update booking status
 */
export const updateBookingStatus = async (bookingId, status) => {
  const response = await authFetch(
    `${API_BASE_URL}/api/bookings/${bookingId}/status`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to update booking status");
  }

  return response.json();
};

/**
 * Cancel booking
 */
export const cancelBooking = async (bookingId) => {
  const response = await authFetch(
    `${API_BASE_URL}/api/bookings/${bookingId}/cancel`,
    {
      method: "POST",
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to cancel booking");
  }

  return response.json();
};
