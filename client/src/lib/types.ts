export interface User {
  id: number;
  username: string;
  displayName: string;
  avatar: string;
  subscribers?: number;
  description?: string;
  createdAt: string;
}

export interface Video {
  id: number;
  userId: number;
  title: string;
  description: string;
  thumbnailUrl: string;
  videoUrl: string;
  views: number;
  likes: number;
  dislikes: number;
  duration: number;
  createdAt: string;
  user?: User;
}

export interface Comment {
  id: number;
  videoId: number;
  userId: number;
  content: string;
  likes: number;
  dislikes: number;
  parentId?: number;
  createdAt: string;
  user?: User;
  replies?: Comment[];
}

export interface Category {
  id: number;
  name: string;
}
