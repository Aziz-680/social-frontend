import axios from "axios";
import { toast } from "sonner";

let sessionExpirationHandled = false;

export const apiClient = axios.create({
  // Use the configured API origin in production; local development keeps the Next.js proxy.
  baseURL: process.env.NEXT_PUBLIC_API_URL || "/api",
  withCredentials: true,
});

// Global interceptor for session expiration
apiClient.interceptors.response.use(
  (response) => {
    if (response.config.url?.includes("/auth/login")) sessionExpirationHandled = false;
    return response;
  },
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      if (
        !sessionExpirationHandled &&
        !["/login", "/register", "/"].includes(window.location.pathname)
      ) {
        sessionExpirationHandled = true;
        toast.error("Your session has expired. Please sign in again.");
        window.dispatchEvent(new Event("social:session-expired"));
      }
    }
    return Promise.reject(error);
  }
);