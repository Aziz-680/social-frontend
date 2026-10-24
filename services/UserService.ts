import { apiClient } from "./apiClient";

class UserService {
  uploadAvatar(formData: FormData) {
    throw new Error("Method not implemented.");
  }
  searchUsers = (query: string) =>
    apiClient.get(`/user/search?q=${encodeURIComponent(query)}`).then((res) => res.data.data);

  getPublicProfile = (userId: string) =>
    apiClient.get(`/user/profile/${userId}`).then((res) => res.data.data);
}

export default new UserService();