export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'parent' | 'admin';
  following: string[]; // List of User IDs followed by this user
  childName?: string;
  username?: string;
  bio?: string;
  website?: string;
}

export interface PostComment {
  id: string;
  authorName: string;
  text: string;
  time: string;
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  tag: string;
  image: string;
  description: string;
  likes: string[]; // List of User IDs who liked this post
  time: string;
  comments: PostComment[];
}

export interface Story {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  image: string;
  time: string;
  tag?: string;
  reactions?: { [emoji: string]: number }; // e.g. { '❤️': 3, '😊': 2 }
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  time: string;
  attachment?: {
    name: string;
    image: string;
  };
}

export interface Conversation {
  id: string;
  participants: string[]; // User IDs (e.g. ['parent-1', 'admin-1'])
  messages: ChatMessage[];
}

export interface Notification {
  id: string;
  userId: string; // Recipient User ID
  text: string;
  time: string;
  isRead: boolean;
  type: 'like' | 'comment' | 'message' | 'announcement';
}

export interface ChildProfileData {
  name: string;
  avatar: string;
  group: string;
  birthdate: string;
  childId: string;
  allergies: string[];
  vaccineStatus: string;
  authorizedContacts: {
    name: string;
    role: string;
    avatar: string;
    phone: string;
    isPrimary?: boolean;
    isOccasional?: boolean;
  }[];
  documents: {
    name: string;
    type: 'image' | 'pdf';
    url?: string;
  }[];
}
