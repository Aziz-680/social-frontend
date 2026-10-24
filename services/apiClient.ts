import axios from "axios";

export const apiClient = axios.create({
  baseURL: "/api",
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