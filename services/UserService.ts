import { apiClient } from "./apiClient";
import type { User, WorkExperience } from "@/lib/types";

export type ProfileUpdate = Partial<
  Pick<User, "firstName" | "lastName" | "age" | "phoneNumber" | "gender" | "status">
> & { workExperience?: WorkExperience[] };

class UserService {
  getProfile = async (): Promise<User> => {
    const response = await apiClient.get("/user/profile");
    return response.data.data;
  };

  getPublicProfile = async (userId: string): Promise<User> => {
    const response = await apiClient.get(`/user/profile/${userId}`);
    return response.data.data;
  };

  search = async (query: string, page = 1): Promise<User[]> => {
    const response = await apiClient.get(
      `/user/search?q=${encodeURIComponent(query)}&page=${page}&limit=20`,
    );
    return response.data.data;
  };

  updateProfile = async (profile: ProfileUpdate): Promise<User> => {
    const response = await apiClient.put("/user/profile", profile);
    return response.data.data;
  };

  uploadAvatar = async (file: File): Promise<User> => {
    const formData = new FormData();
    formData.append("profilePicture", file);
    const response = await apiClient.post("/user/upload-avatar", formData);
    return response.data.data;
  };
}

const userService = new UserService();
export default userService;
