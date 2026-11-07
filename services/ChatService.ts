import { io } from "socket.io-client";
import { apiClient } from "./apiClient";
import type { ChatConversation, ChatMessage } from "@/lib/types";

const socketUrl = process.env.NEXT_PUBLIC_CHAT_SOCKET_URL
  || (process.env.NEXT_PUBLIC_API_URL
    ? new URL(process.env.NEXT_PUBLIC_API_URL).origin
    : "http://localhost:3000");

export type MessagePage = {
  messages: ChatMessage[];
  hasMore: boolean;
  nextBefore: string | null;
};

class ChatService {
  private socketInstance = io(
    socketUrl,
    { autoConnect: false, withCredentials: true },
  );

  get socket() {
    return this.socketInstance;
  }

  async listConversations(): Promise<ChatConversation[]> {
    const response = await apiClient.get("/chat/conversations?page=1&limit=100");
    return response.data.data;
  }

  async createConversation(recipientId: string): Promise<ChatConversation> {
    const response = await apiClient.post("/chat/conversations", { recipientId });
    return response.data.data;
  }

  async getMessages(conversationId: string, before?: string): Promise<MessagePage> {
    const params = new URLSearchParams({ limit: "40" });
    if (before) params.set("before", before);
    const response = await apiClient.get(
      `/chat/conversations/${conversationId}/messages?${params.toString()}`,
    );
    return {
      messages: response.data.data,
      hasMore: Boolean(response.data.meta?.hasMore),
      nextBefore: response.data.meta?.nextBefore ?? null,
    };
  }

  async sendMessage(
    conversationId: string,
    text: string,
    attachment?: File,
  ): Promise<ChatMessage> {
    const body = attachment ? new FormData() : { text };
    if (body instanceof FormData && attachment) {
      body.append("text", text);
      body.append("attachment", attachment);
    }
    const response = await apiClient.post(`/chat/conversations/${conversationId}/messages`, body);
    return response.data.data;
  }

  async markRead(conversationId: string): Promise<void> {
    await apiClient.post(`/chat/conversations/${conversationId}/read`);
  }
}

const chatService = new ChatService();
export default chatService;