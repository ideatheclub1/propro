export interface User {
  id: string;
  username: string;
  avatar: string;
  bio?: string;
  location?: string;
  age?: number;
  isFollowing?: boolean;
  isHost?: boolean;
  hourlyRate?: number;
  totalChats?: number;
  responseTime?: string;
}

export interface Post {
  id: string;
  user: User;
  content: string;
  image?: string;
  likes: number;
  comments: number;
  isLiked: boolean;
  isTrending: boolean;
  timestamp: string;
}

export interface Story {
  id: string;
  user: User;
  image: string;
  expiresAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  participants: User[];
  lastMessage: Message;
  unreadCount: number;
}