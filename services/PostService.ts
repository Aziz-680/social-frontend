/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiClient } from "./apiClient";

class PostService {
  // Helper to normalize backend array or paginated responses
  private extractPostList = (data: any) => {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.posts)) return data.posts;
    return [];
  };

  // 1. Fetch news feed timeline
  getFeedPosts = async (page: number = 1, limit: number = 10) => {
    const response = await apiClient.get(`/post/feed?page=${page}&limit=${limit}`);
    return this.extractPostList(response.data.data);
  };

  // Alias for getFeed
  getFeed = (page: number = 1, limit: number = 10) => {
    return this.getFeedPosts(page, limit);
  };

  // 2. Fetch posts by a specific user ID
  getUserPosts = async (userId: string, page: number = 1, limit: number = 5) => {
    const response = await apiClient.get(`/post/user/${userId}?page=${page}&limit=${limit}`);
    return this.extractPostList(response.data.data);
  };

  // 3. Create a new post
  createPost = async (postData: { content: string; privacy?: string; media?: string[] }) => {
    const response = await apiClient.post(`/post`, postData);
    return response.data.data;
  };

  // 4. Edit an existing post
  editPost = async (postId: string, content: string) => {
    const response = await apiClient.put(`/post/${postId}`, { content });
    return response.data.data;
  };

  // 5. Delete a post
  deletePost = async (postId: string) => {
    const response = await apiClient.delete(`/post/${postId}`);
    return response.data.data;
  };

  // 6. React to a post (like, love, haha, etc.)
  reactToPost = async (postId: string, type: string) => {
    const response = await apiClient.post(`/post/${postId}/react`, { type });
    return response.data.data;
  };

  // 7. Repost content to user timeline
  repost = async (postId: string) => {
    const response = await apiClient.post(`/post/${postId}/repost`);
    return response.data.data;
  };

  // 8. Add a comment
  addComment = async (postId: string, content: string) => {
    const response = await apiClient.post(`/post/${postId}/comment`, { content });
    return response.data.data;
  };

  // 9. Edit a comment
  editComment = async (postId: string, commentId: string, content: string) => {
    const response = await apiClient.put(`/post/${postId}/comment/${commentId}`, { content });
    return response.data.data;
  };

  // 10. Delete a comment
  deleteComment = async (postId: string, commentId: string) => {
    const response = await apiClient.delete(`/post/${postId}/comment/${commentId}`);
    return response.data.data;
  };

  // 11. React to a comment
  reactToComment = async (postId: string, commentId: string, type: string) => {
    const response = await apiClient.post(`/post/${postId}/comment/${commentId}/react`, { type });
    return response.data.data;
  };
}

export default new PostService();