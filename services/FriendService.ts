import { apiClient } from "./apiClient";
import type { User } from "@/lib/types";

class FriendService {
  getFriends = async (): Promise<User[]> => {
    const response = await apiClient.get("/friend");
    return response.data.data;
  };

  getFriendsForUser = async (userId: string): Promise<User[]> => {
    const response = await apiClient.get(`/friend/list/${userId}`);
    return response.data.data;
  };

  getFriendStatus = async (userId: string): Promise<string> => {
    const response = await apiClient.get(`/friend/status/${userId}`);
    return response.data.data.status;
  };

  sendRequest = async (recipientId: string): Promise<void> => {
    await apiClient.post(`/friend/request/${recipientId}`);
  };

  acceptRequest = async (senderId: string): Promise<void> => {
    await apiClient.post(`/friend/accept/${senderId}`);
  };

  rejectRequest = async (senderId: string): Promise<void> => {
    await apiClient.post(`/friend/reject/${senderId}`);
  };

  unfriend = async (friendId: string): Promise<void> => {
    await apiClient.delete(`/friend/${friendId}`);
  };

  getPendingRequests = async (): Promise<User[]> => {
    const response = await apiClient.get("/friend/requests");
    return response.data.data;
  };
}

const friendService = new FriendService();
export default friendService;