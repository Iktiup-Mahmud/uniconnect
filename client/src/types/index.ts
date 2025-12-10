export interface User {
  _id: string;
  name: string;
  email: string;
  username: string;
  bio?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Post {
  _id: string;
  content: string;
  author: User;
  likes: string[];
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  _id: string;
  content: string;
  author: User;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    token: string;
    user: User;
  };
  message: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}
