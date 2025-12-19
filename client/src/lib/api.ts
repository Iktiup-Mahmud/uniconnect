import { Post, User, ApiResponse } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const api = {
  // Auth
  async login(email: string, password: string) {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  },

  async register(data: { name: string; email: string; username: string; password: string }) {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  // Posts
  async getPosts(): Promise<ApiResponse<{ posts: Post[] }>> {
    const response = await fetch(`${API_URL}/posts`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  async createPost(content: string): Promise<ApiResponse<{ post: Post }>> {
    const response = await fetch(`${API_URL}/posts`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ content }),
    });
    return response.json();
  },

  async likePost(postId: string): Promise<ApiResponse<{ post: Post }>> {
    const response = await fetch(`${API_URL}/posts/${postId}/like`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  async deletePost(postId: string): Promise<ApiResponse<null>> {
    const response = await fetch(`${API_URL}/posts/${postId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  // Users
  async getUser(userId: string): Promise<ApiResponse<{ user: User }>> {
    const response = await fetch(`${API_URL}/users/${userId}`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  async updateProfile(data: Partial<User>): Promise<ApiResponse<{ user: User }>> {
    const response = await fetch(`${API_URL}/users/profile`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return response.json();
  },
};
