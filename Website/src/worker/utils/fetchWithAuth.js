import { authFetch } from "../../utils/authFetch";

/**
 * Helper function to make authenticated API calls
 */
export const fetchWithAuth = async (url, options = {}) => {
    const headers = {
        ...options.headers,
    };

    // Add Content-Type for JSON requests if not already set and body exists
    if (options.body && typeof options.body === 'string' && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
    }

    const response = await authFetch(url, {
        ...options,
        headers,
    });

    // If unauthorized, clear localStorage and redirect to login
    if (response.status === 401) {
        window.location.href = '/';
    }

    return response;
};
