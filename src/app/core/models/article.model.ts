// core/models/article.model.ts
import {User} from './user.model';

export interface Article {
  _id: string;
  title: string;
  content: string;
  excerpt?: string;
  featuredImage?: {
    imageId: string;
    filename: string;
    url: string;
    originalName: string;
    mimetype?: string;
    size?: number;
  };
  tags: string[];
  status: 'draft' | 'published';
  author: User;
  slug: string;
  viewCount: number;
  likes: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ArticleCreateRequest {
  title: string;
  content: string;
  excerpt?: string;
  featuredImage?: {
    imageId: string;
    filename: string;
    url: string;
    originalName: string;
    mimetype?: string;
    size?: number;
  };
  tags: string[];
  status: 'draft' | 'published';
}

export interface ArticleResponse {
  success: boolean;
  data: {
    article: Article;
  };
  message?: string;
}

export interface ArticleByIdResponse {
  success: boolean;
  data: {
    article: Article;
    pagination: {
      current: number;
      pages: number;
      total: number;
    };
  };
}

export interface ArticlesResponse {
  success: boolean;
  data: {
    articles: Article[];
    pagination: {
      current: number;
      pages: number;
      total: number;
    };
  };
}
