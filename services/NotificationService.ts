import { apiClient } from "./apiClient";
import type { NotificationItem, Pagination } from "@/lib/types";

type NotificationPage = {
  notifications: NotificationItem[];
  unreadCount: number;
  pagination: Pagination;
};

class NotificationService {
  getNotifications = async (page = 1, limit = 20): Promise<NotificationPage> => {
    const response = await apiClient.get(`/notification?page=${page}&limit=${limit}`);
    return {
      notifications: response.data.data,
      unreadCount: response.data.meta?.unreadCount ?? 0,
      pagination: response.data.meta?.pagination,
    };
  };

  markAsRead = async (notificationId: string): Promise<void> => {
    await apiClient.patch(`/notification/${notificationId}/read`);
  };

  markAllAsRead = async (): Promise<void> => {
    await apiClient.patch("/notification/read-all");
  };
}

const notificationService = new NotificationService();
export default notificationService;
