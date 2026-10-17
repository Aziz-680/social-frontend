import { apiClient } from "./apiClient";

class FriendService {
  sendRequest = (recipientId: string) => 
    apiClient.post(`/friend/request/${recipientId}`).then((res) => res.data);

  acceptRequest = (senderId: string) => 
    apiClient.post(`/friend/accept/${senderId}`).then((res) => res.data);

  rejectRequest = (senderId: string) => 
    apiClient.post(`/friend/reject/${senderId}`).then((res) => res.data);

  unfriend = (friendId: string) => 
    apiClient.delete(`/friend/${friendId}`).then((res) => res.data);

  getPendingRequests = () => 
    apiClient.get(`/friend/requests`).then((res) => res.data.data);
}

export default new FriendService();