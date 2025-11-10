import {Article} from './article.model';

export interface Comment {
  _id: string;
  content: string;
  author: {
    _id: string;
    username: string;
    profile: {
      firstName: string;
      lastName: string;
      avatar: string;
    };
  };
  article: string;
  parentComment?: string;
  replies?: Comment[]; // Rendons cette propriété optionnelle
  isEdited: boolean;
  likes: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CommentResponse {
  success: boolean;
  data: {
    comments: Comment[];
    pagination: {
      current: number;
      pages: number;
      total: number;
    };
  };
}

export interface CommentCreateRequest {
  content: string;
  article: string;
  parentComment?: string;
}

export interface Notification {
  _id: string;
  type: 'comment' | 'like' | 'reply' | 'system';
  title: string;
  message: string;
  data: any;
  isRead: boolean;
  recipient: string;
  createdAt: string;
}

