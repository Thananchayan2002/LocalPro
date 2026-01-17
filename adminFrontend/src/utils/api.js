import axios from "axios";

// API Configuration
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

// Configure axios to send cookies with every request
axios.defaults.withCredentials = true;
axios.defaults.baseURL = API_BASE_URL;

export const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;

  // Ensure credentials are included for fetch calls
  const fetchOptions = {
    ...options,
    credentials: "include",
  };

  return fetch(url, fetchOptions);
};
