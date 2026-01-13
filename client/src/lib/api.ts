import {
  Post,
  User,
  ApiResponse,
  AuthResponse,
  Portfolio,
  Course,
  Club,
  Event,
  Message,
  Conversation,
  Notification,
  Announcement,
} from "@/types";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api/v1";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Helper to convert backend response format to frontend format
const convertResponse = <T>(backendResponse: {
  status?: string;
  message?: string;
  data?: T;
}): ApiResponse<T> => {
  return {
    success: backendResponse.status === "success",
    message: backendResponse.message || "",
    data: backendResponse.data as T,
  };
};

// Helper to handle API errors
const handleResponse = async <T>(
  response: Response
): Promise<ApiResponse<T>> => {
  const backendData = await response.json();

  if (!response.ok) {
    throw new Error(backendData.message || `API error: ${response.statusText}`);
  }

  return convertResponse<T>(backendData);
};

export const api = {
  // Auth
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const backendData = await response.json();

    if (!response.ok) {
      throw new Error(backendData.message || "Login failed");
    }

    return {
      success: backendData.status === "success",
      message: backendData.message || "",
      data: backendData.data,
    };
  },

  async register(userData: {
    name: string;
    email: string;
    username: string;
    password: string;
    role?: "student" | "faculty";
  }): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    const backendData = await response.json();

    if (!response.ok) {
      throw new Error(backendData.message || "Registration failed");
    }

    return {
      success: backendData.status === "success",
      message: backendData.message || "",
      data: backendData.data,
    };
  },

  // Posts
  async getPosts(): Promise<ApiResponse<{ posts: Post[] }>> {
    const response = await fetch(`${API_URL}/posts`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<{ posts: Post[] }>(response);
  },

  async getUserPosts(userId?: string): Promise<ApiResponse<{ posts: Post[] }>> {
    const url = userId
      ? `${API_URL}/posts/user/${userId}`
      : `${API_URL}/posts/user`;
    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });
    return handleResponse<{ posts: Post[] }>(response);
  },

  async updatePost(
    postId: string,
    data: { content?: string; images?: string[] }
  ): Promise<ApiResponse<{ post: Post }>> {
    const response = await fetch(`${API_URL}/posts/${postId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<{ post: Post }>(response);
  },

  async createPost(data: {
    content?: string;
    images?: string[];
    videos?: string[];
  }): Promise<ApiResponse<{ post: Post }>> {
    const response = await fetch(`${API_URL}/posts`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<{ post: Post }>(response);
  },

  async likePost(postId: string): Promise<ApiResponse<{ post: Post }>> {
    const response = await fetch(`${API_URL}/posts/${postId}/like`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    return handleResponse<{ post: Post }>(response);
  },

  async deletePost(postId: string): Promise<ApiResponse<null>> {
    const response = await fetch(`${API_URL}/posts/${postId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return handleResponse<null>(response);
  },

  // Users
  async getUsers(): Promise<ApiResponse<{ users: User[] }>> {
    const response = await fetch(`${API_URL}/users`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<{ users: User[] }>(response);
  },

  async getUser(userId: string): Promise<ApiResponse<{ user: User }>> {
    const response = await fetch(`${API_URL}/users/${userId}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<{ user: User }>(response);
  },

  async getProfile(): Promise<ApiResponse<{ user: User }>> {
    const response = await fetch(`${API_URL}/users/profile`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<{ user: User }>(response);
  },

  async updateProfile(
    data: Partial<User>
  ): Promise<ApiResponse<{ user: User }>> {
    const response = await fetch(`${API_URL}/users/profile`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<{ user: User }>(response);
  },

  async deleteUser(userId: string): Promise<ApiResponse<null>> {
    const response = await fetch(`${API_URL}/users/${userId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return handleResponse<null>(response);
  },

  // Portfolio
  async getPortfolio(
    userId: string
  ): Promise<ApiResponse<{ portfolio: Portfolio }>> {
    const response = await fetch(`${API_URL}/portfolios/${userId}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<{ portfolio: Portfolio }>(response);
  },

  async createOrUpdatePortfolio(
    data: Partial<Portfolio>
  ): Promise<ApiResponse<{ portfolio: Portfolio }>> {
    const response = await fetch(`${API_URL}/portfolios`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<{ portfolio: Portfolio }>(response);
  },

  async deletePortfolio(): Promise<ApiResponse<null>> {
    const response = await fetch(`${API_URL}/portfolios`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return handleResponse<null>(response);
  },

  // Courses
  async getCourses(params?: {
    semester?: string;
    year?: number;
  }): Promise<ApiResponse<{ courses: Course[] }>> {
    const queryParams = new URLSearchParams();
    if (params?.semester) queryParams.append("semester", params.semester);
    if (params?.year) queryParams.append("year", params.year.toString());
    const url = `${API_URL}/courses${
      queryParams.toString() ? `?${queryParams}` : ""
    }`;
    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });
    return handleResponse<{ courses: Course[] }>(response);
  },

  async getCourse(courseId: string): Promise<ApiResponse<{ course: Course }>> {
    const response = await fetch(`${API_URL}/courses/${courseId}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<{ course: Course }>(response);
  },

  async getCourseById(
    courseId: string
  ): Promise<ApiResponse<{ course: Course }>> {
    const response = await fetch(`${API_URL}/courses/${courseId}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<{ course: Course }>(response);
  },

  async createCourse(data: {
    code: string;
    name: string;
    description?: string;
    semester: string;
    year: number;
  }): Promise<ApiResponse<{ course: Course }>> {
    const response = await fetch(`${API_URL}/courses`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<{ course: Course }>(response);
  },

  async enrollInCourse(
    courseId: string
  ): Promise<ApiResponse<{ course: Course }>> {
    const response = await fetch(`${API_URL}/courses/${courseId}/enroll`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    return handleResponse<{ course: Course }>(response);
  },

  async addCourseMaterial(
    courseId: string,
    data: {
      title: string;
      type: "document" | "video" | "link" | "assignment";
      url: string;
      description?: string;
    }
  ): Promise<ApiResponse<{ course: Course }>> {
    const response = await fetch(`${API_URL}/courses/${courseId}/materials`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<{ course: Course }>(response);
  },

  async createAssignment(
    courseId: string,
    data: {
      title: string;
      description?: string;
      dueDate: string;
      maxScore?: number;
    }
  ): Promise<ApiResponse<{ course: Course }>> {
    const response = await fetch(`${API_URL}/courses/${courseId}/assignments`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<{ course: Course }>(response);
  },

  async submitAssignment(
    courseId: string,
    assignmentIndex: number,
    data: {
      fileUrl?: string;
      text?: string;
    }
  ): Promise<ApiResponse<{ course: Course }>> {
    const response = await fetch(
      `${API_URL}/courses/${courseId}/assignments/${assignmentIndex}/submit`,
      {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      }
    );
    return handleResponse<{ course: Course }>(response);
  },

  // Clubs
  async getClubs(params?: {
    category?: string;
    isActive?: boolean;
  }): Promise<ApiResponse<{ clubs: Club[] }>> {
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.append("category", params.category);
    if (params?.isActive !== undefined)
      queryParams.append("isActive", params.isActive.toString());
    const url = `${API_URL}/clubs${
      queryParams.toString() ? `?${queryParams}` : ""
    }`;
    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });
    return handleResponse<{ clubs: Club[] }>(response);
  },

  async getClub(clubId: string): Promise<ApiResponse<{ club: Club }>> {
    const response = await fetch(`${API_URL}/clubs/${clubId}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<{ club: Club }>(response);
  },

  async getClubById(clubId: string): Promise<ApiResponse<{ club: Club }>> {
    const response = await fetch(`${API_URL}/clubs/${clubId}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<{ club: Club }>(response);
  },

  async createClub(data: {
    name: string;
    description?: string;
    category: string;
    imageUrl?: string;
  }): Promise<ApiResponse<{ club: Club }>> {
    const response = await fetch(`${API_URL}/clubs`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<{ club: Club }>(response);
  },

  async joinClub(clubId: string): Promise<ApiResponse<{ club: Club }>> {
    const response = await fetch(`${API_URL}/clubs/${clubId}/join`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    return handleResponse<{ club: Club }>(response);
  },

  async leaveClub(clubId: string): Promise<ApiResponse<{ club: Club }>> {
    const response = await fetch(`${API_URL}/clubs/${clubId}/leave`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    return handleResponse<{ club: Club }>(response);
  },

  async updateClub(
    clubId: string,
    data: Partial<Club>
  ): Promise<ApiResponse<{ club: Club }>> {
    const response = await fetch(`${API_URL}/clubs/${clubId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<{ club: Club }>(response);
  },

  // Events
  async getEvents(params?: {
    category?: string;
    clubId?: string;
    courseId?: string;
    upcoming?: boolean;
  }): Promise<ApiResponse<{ events: Event[] }>> {
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.append("category", params.category);
    if (params?.clubId) queryParams.append("clubId", params.clubId);
    if (params?.courseId) queryParams.append("courseId", params.courseId);
    if (params?.upcoming !== undefined)
      queryParams.append("upcoming", params.upcoming.toString());
    const url = `${API_URL}/events${
      queryParams.toString() ? `?${queryParams}` : ""
    }`;
    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });
    return handleResponse<{ events: Event[] }>(response);
  },

  async getEvent(eventId: string): Promise<ApiResponse<{ event: Event }>> {
    const response = await fetch(`${API_URL}/events/${eventId}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<{ event: Event }>(response);
  },

  async getEventById(eventId: string): Promise<ApiResponse<{ event: Event }>> {
    const response = await fetch(`${API_URL}/events/${eventId}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<{ event: Event }>(response);
  },

  async createEvent(data: {
    title: string;
    description?: string;
    eventDate: string;
    location: string;
    category: string;
    clubId?: string;
    courseId?: string;
    maxAttendees?: number;
    imageUrl?: string;
  }): Promise<ApiResponse<{ event: Event }>> {
    const response = await fetch(`${API_URL}/events`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<{ event: Event }>(response);
  },

  async rsvpEvent(eventId: string): Promise<ApiResponse<{ event: Event }>> {
    const response = await fetch(`${API_URL}/events/${eventId}/rsvp`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    return handleResponse<{ event: Event }>(response);
  },

  async cancelRsvp(eventId: string): Promise<ApiResponse<{ event: Event }>> {
    const response = await fetch(`${API_URL}/events/${eventId}/cancel-rsvp`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    return handleResponse<{ event: Event }>(response);
  },

  async updateEvent(
    eventId: string,
    data: Partial<Event>
  ): Promise<ApiResponse<{ event: Event }>> {
    const response = await fetch(`${API_URL}/events/${eventId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<{ event: Event }>(response);
  },

  async deleteEvent(eventId: string): Promise<ApiResponse<null>> {
    const response = await fetch(`${API_URL}/events/${eventId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return handleResponse<null>(response);
  },

  // Messages
  async getConversations(): Promise<
    ApiResponse<{ conversations: Conversation[] }>
  > {
    const response = await fetch(`${API_URL}/messages/conversations`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<{ conversations: Conversation[] }>(response);
  },

  async getConversation(
    conversationId: string
  ): Promise<ApiResponse<{ conversation: Conversation; messages: Message[] }>> {
    const response = await fetch(
      `${API_URL}/messages/conversations/${conversationId}`,
      {
        headers: getAuthHeaders(),
      }
    );
    return handleResponse<{ conversation: Conversation; messages: Message[] }>(
      response
    );
  },

  async createConversation(data: {
    participantIds: string[];
    type?: "direct" | "group";
    groupName?: string;
    groupImage?: string;
  }): Promise<ApiResponse<{ conversation: Conversation }>> {
    const response = await fetch(`${API_URL}/messages/conversations`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<{ conversation: Conversation }>(response);
  },

  async sendMessage(
    conversationId: string,
    data: {
      content: string;
      messageType?: "text" | "image" | "file";
      fileUrl?: string;
    }
  ): Promise<ApiResponse<{ message: Message }>> {
    const response = await fetch(
      `${API_URL}/messages/conversations/${conversationId}/messages`,
      {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      }
    );
    return handleResponse<{ message: Message }>(response);
  },

  async markMessagesAsRead(conversationId: string): Promise<ApiResponse<null>> {
    const response = await fetch(
      `${API_URL}/messages/conversations/${conversationId}/read`,
      {
        method: "PUT",
        headers: getAuthHeaders(),
      }
    );
    return handleResponse<null>(response);
  },

  // Notifications
  async getNotifications(params?: {
    unreadOnly?: boolean;
  }): Promise<
    ApiResponse<{ notifications: Notification[]; unreadCount: number }>
  > {
    const queryParams = new URLSearchParams();
    if (params?.unreadOnly !== undefined)
      queryParams.append("unreadOnly", params.unreadOnly.toString());
    const url = `${API_URL}/notifications${
      queryParams.toString() ? `?${queryParams}` : ""
    }`;
    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });
    return handleResponse<{
      notifications: Notification[];
      unreadCount: number;
    }>(response);
  },

  async markNotificationAsRead(
    notificationId: string
  ): Promise<ApiResponse<{ notification: Notification }>> {
    const response = await fetch(
      `${API_URL}/notifications/${notificationId}/read`,
      {
        method: "PUT",
        headers: getAuthHeaders(),
      }
    );
    return handleResponse<{ notification: Notification }>(response);
  },

  async markAllNotificationsAsRead(): Promise<ApiResponse<null>> {
    const response = await fetch(`${API_URL}/notifications/read-all`, {
      method: "PUT",
      headers: getAuthHeaders(),
    });
    return handleResponse<null>(response);
  },

  async deleteNotification(notificationId: string): Promise<ApiResponse<null>> {
    const response = await fetch(`${API_URL}/notifications/${notificationId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return handleResponse<null>(response);
  },

  // Announcements
  async getAnnouncements(params?: {
    courseId?: string;
    clubId?: string;
    targetAudience?: string;
  }): Promise<ApiResponse<{ announcements: Announcement[] }>> {
    const queryParams = new URLSearchParams();
    if (params?.courseId) queryParams.append("courseId", params.courseId);
    if (params?.clubId) queryParams.append("clubId", params.clubId);
    if (params?.targetAudience)
      queryParams.append("targetAudience", params.targetAudience);
    const url = `${API_URL}/announcements${
      queryParams.toString() ? `?${queryParams}` : ""
    }`;
    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });
    return handleResponse<{ announcements: Announcement[] }>(response);
  },

  async getAnnouncement(
    announcementId: string
  ): Promise<ApiResponse<{ announcement: Announcement }>> {
    const response = await fetch(`${API_URL}/announcements/${announcementId}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<{ announcement: Announcement }>(response);
  },

  async createAnnouncement(data: {
    title: string;
    content: string;
    targetAudience?: "all" | "students" | "faculty" | "club_members";
    courseId?: string;
    clubId?: string;
    isPinned?: boolean;
    attachments?: string[];
  }): Promise<ApiResponse<{ announcement: Announcement }>> {
    const response = await fetch(`${API_URL}/announcements`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<{ announcement: Announcement }>(response);
  },

  async updateAnnouncement(
    announcementId: string,
    data: Partial<Announcement>
  ): Promise<ApiResponse<{ announcement: Announcement }>> {
    const response = await fetch(`${API_URL}/announcements/${announcementId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<{ announcement: Announcement }>(response);
  },

  async deleteAnnouncement(announcementId: string): Promise<ApiResponse<null>> {
    const response = await fetch(`${API_URL}/announcements/${announcementId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return handleResponse<null>(response);
  },

  // Comments
  async getComments(
    postId: string
  ): Promise<ApiResponse<{ comments: Comment[] }>> {
    const response = await fetch(`${API_URL}/comments/posts/${postId}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<{ comments: Comment[] }>(response);
  },

  async createComment(
    postId: string,
    content: string
  ): Promise<ApiResponse<{ comment: Comment }>> {
    const response = await fetch(`${API_URL}/comments/posts/${postId}`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ content }),
    });
    return handleResponse<{ comment: Comment }>(response);
  },

  async updateComment(
    commentId: string,
    content: string
  ): Promise<ApiResponse<{ comment: Comment }>> {
    const response = await fetch(`${API_URL}/comments/${commentId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ content }),
    });
    return handleResponse<{ comment: Comment }>(response);
  },

  async deleteComment(commentId: string): Promise<ApiResponse<null>> {
    const response = await fetch(`${API_URL}/comments/${commentId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return handleResponse<null>(response);
  },

  async likeComment(
    commentId: string
  ): Promise<ApiResponse<{ comment: Comment }>> {
    const response = await fetch(`${API_URL}/comments/${commentId}/like`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    return handleResponse<{ comment: Comment }>(response);
  },

  // Uploads
  async uploadProfilePicture(
    file: File
  ): Promise<ApiResponse<{ avatar: string }>> {
    const formData = new FormData();
    formData.append("avatar", file);

    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/upload/profile`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    return handleResponse<{ avatar: string }>(response);
  },

  async uploadPostMedia(
    file: File
  ): Promise<ApiResponse<{ url: string; type: string }>> {
    const formData = new FormData();
    formData.append("media", file);

    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/upload/media`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    return handleResponse<{ url: string; type: string }>(response);
  },

  async uploadMultipleMedia(
    files: File[]
  ): Promise<ApiResponse<{ urls: string[] }>> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("media", file);
    });

    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/upload/media/multiple`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    return handleResponse<{ urls: string[] }>(response);
  },
};
