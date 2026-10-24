import { apiClient } from "./apiClient";
import type { User } from "@/lib/types";

class AuthService {
  async login(email: string, password: string) {
    const response = await apiClient.post("/auth/login", { email, password });
    return response.data;
  }

  async register(
    firstName: string,
    lastName: string,
    email: string,
    password: string,
  ) {
    const response = await apiClient.post("/auth/register", {
      firstName,
      lastName,
      email,
      password,
    });
    return response.data;
  }

  async logout() {
    await apiClient.post("/auth/logout");
  }

  async checkSession() {
    const response = await apiClient.get("/auth/me");
    return response.data.data as { user: User };
  }
}

const authService = new AuthService();
export default authService;
