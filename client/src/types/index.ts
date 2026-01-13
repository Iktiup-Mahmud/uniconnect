export interface User {
  _id: string;
  name: string;
  email: string;
  username: string;
  bio?: string;
  avatar?: string;
  role: "student" | "faculty" | "admin";
  followers?: string[];
  following?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Post {
  _id: string;
  content: string;
  author: User;
  images?: string[];
  likes: string[]; // Array of user IDs who liked the post
  comments: Comment[] | string[]; // Can be ObjectId array or populated Comment array
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  _id: string;
  content: string;
  userId: User;
  postId?: string;
  likes?: string[];
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

// Backend response format (before conversion)
export interface BackendResponse<T> {
  status: "success" | "fail" | "error";
  message: string;
  data: T;
}

// Portfolio Types
export interface Portfolio {
  _id: string;
  userId: User;
  title: string;
  description: string;
  projects: {
    name: string;
    description: string;
    technologies: string[];
    githubUrl?: string;
    liveUrl?: string;
    imageUrl?: string;
  }[];
  achievements: {
    title: string;
    description: string;
    date: string;
    issuer?: string;
  }[];
  skills: string[];
  education: {
    degree: string;
    institution: string;
    year: number;
    gpa?: string;
  }[];
  certifications: {
    name: string;
    issuer: string;
    date: string;
    credentialId?: string;
    url?: string;
  }[];
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

// Course Types
export interface Course {
  _id: string;
  code: string;
  name: string;
  description: string;
  instructor: User;
  students: User[];
  materials: {
    title: string;
    type: "document" | "video" | "link" | "assignment";
    url: string;
    description?: string;
    uploadedAt: string;
  }[];
  announcements: string[];
  assignments: {
    title: string;
    description: string;
    dueDate: string;
    maxScore: number;
    submissions: {
      studentId: User;
      submittedAt: string;
      fileUrl?: string;
      text?: string;
      score?: number;
      gradedAt?: string;
    }[];
  }[];
  semester: "Fall" | "Spring" | "Summer";
  year: number;
  createdAt: string;
  updatedAt: string;
}

// Club Types
export interface Club {
  _id: string;
  name: string;
  description: string;
  organizer: User;
  members: User[];
  events: string[];
  imageUrl?: string;
  category:
    | "Academic"
    | "Sports"
    | "Arts"
    | "Technology"
    | "Cultural"
    | "Social"
    | "Volunteer"
    | "Other";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Event Types
export interface Event {
  _id: string;
  title: string;
  description: string;
  organizer: User;
  clubId?: Club;
  courseId?: Course;
  eventDate: string;
  location: string;
  imageUrl?: string;
  attendees: User[];
  maxAttendees?: number;
  isPublic: boolean;
  category:
    | "Workshop"
    | "Seminar"
    | "Conference"
    | "Social"
    | "Sports"
    | "Cultural"
    | "Academic"
    | "Other";
  createdAt: string;
  updatedAt: string;
}

// Message Types
export interface Message {
  _id: string;
  conversationId: string;
  senderId: User;
  content: string;
  messageType: "text" | "image" | "file";
  fileUrl?: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  _id: string;
  participants: User[];
  type: "direct" | "group";
  groupName?: string;
  groupImage?: string;
  lastMessage?: Message;
  lastMessageAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Notification Types
export interface Notification {
  _id: string;
  userId: string;
  type:
    | "post_like"
    | "post_comment"
    | "event_invite"
    | "club_invite"
    | "course_announcement"
    | "assignment_due"
    | "message"
    | "follow"
    | "system";
  title: string;
  message: string;
  relatedId?: string;
  relatedType?: "post" | "event" | "club" | "course" | "message" | "user";
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Announcement Types
export interface Announcement {
  _id: string;
  title: string;
  content: string;
  author: User;
  targetAudience: "all" | "students" | "faculty" | "club_members";
  courseId?: Course;
  clubId?: Club;
  isPinned: boolean;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}
