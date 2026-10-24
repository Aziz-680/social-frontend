import axios from "axios";

// Fallback to exactly where the Express server lives
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const apiClient = axios.create({
  baseURL: "/api", // Relative path handled by Next.js proxy rewrite
  withCredentials: true,
});

// Global interceptor for session expiration
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      if (!["/login", "/register", "/"].includes(window.location.pathname)) {
        window.dispatchEvent(new Event("social:session-expired"));
      }
    }
    return Promise.reject(error);
  }
);