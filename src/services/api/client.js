import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api/v1";

/**
 * apiClient
 * Reusable Axios client configured with base URL, timeout, and interceptors.
 */
export const apiClient = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor to unpack standard API envelopes and handle errors
apiClient.interceptors.response.use(
  (response) => {
    // Standard envelope structure: { success: true, data: ... }
    if (response.data && response.data.success === true) {
      return response.data.data;
    }
    return response.data;
  },
  (error) => {
    const errorData = error.response?.data?.error || {};
    const apiError = {
      message: errorData.message || error.message || "An unexpected error occurred",
      code: errorData.code || "API_ERROR",
      status: error.response?.status || 500,
      originalError: error,
    };
    return Promise.reject(apiError);
  }
);

export default apiClient;
