import { apiClient } from "./apiClient";
import type { PaginatedPosts, Post, ReactionType } from "@/lib/types";

class PostService {
  getFeed = async (page = 1, limit = 10): Promise<PaginatedPosts> => {
    const response = await apiClient.get(`/post?page=${page}&limit=${limit}`);
    return {
      posts: response.data.data,
      pagination: response.data.meta.pagination,
    };
  };

  getUserPosts = async (userId: string, page = 1, limit = 5): Promise<PaginatedPosts> => {
    const response = await apiClient.get(`/post/user/${userId}?page=${page}&limit=${limit}`);
    return {
      posts: response.data.data,
      pagination: response.data.meta.pagination,
    };
  };

  createPost = async (formData: FormData): Promise<Post> => {
    const response = await apiClient.post("/post", formData);
    return response.data.data;
  };

  editPost = async (
    postId: string,
    content: string | undefined,
    privacy: Post["privacy"],
  ): Promise<Post> => {
    const payload: { content?: string; privacy: Post["privacy"] } = { privacy };
    if (content?.trim()) payload.content = content;
    const response = await apiClient.put(`/post/${postId}`, payload);
    return response.data.data;
  };

  deletePost = async (postId: string): Promise<void> => {
    await apiClient.delete(`/post/${postId}`);
  };

  reactToPost = async (postId: string, type: ReactionType): Promise<Post> => {
    const response = await apiClient.post(`/post/${postId}/react`, { type });
    return response.data.data;
  };

  addComment = async (postId: string, content: string): Promise<Post> => {
    const response = await apiClient.post(`/post/${postId}/comment`, { content });
    return response.data.data;
  };

  editComment = async (postId: string, commentId: string, content: string): Promise<Post> => {
    const response = await apiClient.put(`/post/${postId}/comment/${commentId}`, { content });
    return response.data.data;
  };

  deleteComment = async (postId: string, commentId: string): Promise<Post> => {
    const response = await apiClient.delete(`/post/${postId}/comment/${commentId}`);
    return response.data.data;
  };

  reactToComment = async (
    postId: string,
    commentId: string,
    type: ReactionType,
  ): Promise<Post> => {
    const response = await apiClient.post(`/post/${postId}/comment/${commentId}/react`, { type });
    return response.data.data;
  };

  repost = async (postId: string): Promise<Post> => {
    const response = await apiClient.post(`/post/${postId}/repost`);
    return response.data.data;
  };
}

const postService = new PostService();
export default postService;