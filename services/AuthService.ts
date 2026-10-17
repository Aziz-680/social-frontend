import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:3000/api/auth",
  withCredentials: true,
});

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("Session expired or unauthorized. Redirecting to login...");
      if (
        typeof window !== "undefined" &&
        window.location.pathname !== "/login"
      ) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

class AuthService {
  async login(email: string, password: string) {
    const response = await apiClient.post(`/login`, { email, password });
    return response.data;
  }

  async register(
    firstName: string,
    lastName: string,
    email: string,
    password: string,
  ) {
    const response = await apiClient.post(`/register`, {
      firstName,
      lastName,
      email,
      password,
    });
    return response.data;
  }

  async logout() {
    try {
      await axios.post(
        "http://localhost:3000/api/auth/logout",
        {},
        { withCredentials: true },
      );
    } catch (error) {
      console.error("Logout error", error);
    } finally {
      window.location.href = "/login"; 
    }
  }

  async checkSession() {
    try {
      const response = await apiClient.get(`/me`);
      return response.data.data; 
    } catch (error) {
      return null; 
    }
  }
}

export default new AuthService();
