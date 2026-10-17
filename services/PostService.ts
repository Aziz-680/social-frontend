/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiClient } from "./apiClient";

class PostService {
  getUserPosts(_id: any, page: number, arg2: number) {
    throw new Error("Method not implemented.");
  }
  deletePost(_id: any) {
    throw new Error("Method not implemented.");
  }
  editPost(_id: any, editPostContent: any) {
    throw new Error("Method not implemented.");
  }
  getFeed = (page = 1, limit = 10) => 
    apiClient.get(`/post?page=${page}&limit=${limit}`).then((res) => res.data.data);

  createPost = (formData: FormData) => 
    apiClient.post(`/post/imgupld`, formData, { headers: { "Content-Type": "multipart/form-data" } }).then((res) => res.data.data);

  reactToPost = (postId: string, type: string) => 
    apiClient.post(`/post/${postId}/react`, { type }).then((res) => res.data.data);

  addComment = (postId: string, content: string) => 
    apiClient.post(`/post/${postId}/comment`, { content }).then((res) => res.data.data);

  editComment = (postId: string, commentId: string, content: string) => 
    apiClient.put(`/post/${postId}/comment/${commentId}`, { content }).then((res) => res.data.data);

  deleteComment = (postId: string, commentId: string) => 
    apiClient.delete(`/post/${postId}/comment/${commentId}`).then((res) => res.data.data);

  reactToComment = (postId: string, commentId: string, type: string) => 
    apiClient.post(`/post/${postId}/comment/${commentId}/react`, { type }).then((res) => res.data.data);

  repost = (postId: string) => 
    apiClient.post(`/post/${postId}/repost`).then((res) => res.data.data);
}

export default new PostService();