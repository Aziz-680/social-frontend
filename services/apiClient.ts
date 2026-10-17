import axios from "axios";

export const apiClient = axios.create({
  baseURL: "/api", // Relative path handled by Next.js proxy rewrite
  withCredentials: true,
});

// Global interceptor for session expiration
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);