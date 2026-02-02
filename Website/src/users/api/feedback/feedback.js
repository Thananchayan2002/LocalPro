const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

// Create feedback (public endpoint - no authentication required)
export const createFeedback = async (feedbackData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/feedback/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(feedbackData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to submit feedback");
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating feedback:", error);
    throw error;
  }
};

// Get featured feedback for testimonials
export const getFeaturedFeedback = async (limit = 6) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/feedback/featured?limit=${limit}`);

    if (!response.ok) {
      throw new Error("Failed to fetch testimonials");
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error("Error fetching featured feedback:", error);
    return [];
  }
};

// Get all feedback (for admin)
export const getAllFeedback = async (page = 1, limit = 10, filters = {}) => {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) {
      throw new Error("No authentication token found");
    }

    const params = new URLSearchParams({
      page,
      limit,
      ...filters,
    });

    const response = await fetch(`${API_BASE_URL}/api/feedback/all?${params}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch feedback");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching feedback:", error);
    throw error;
  }
};

// Get feedback statistics
export const getFeedbackStats = async () => {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(`${API_BASE_URL}/api/feedback/stats`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch feedback statistics");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching feedback stats:", error);
    throw error;
  }
};

// Mark feedback as read
export const markFeedbackAsRead = async (feedbackId) => {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(`${API_BASE_URL}/api/feedback/${feedbackId}/read`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to mark feedback as read");
    }

    return await response.json();
  } catch (error) {
    console.error("Error marking feedback as read:", error);
    throw error;
  }
};
