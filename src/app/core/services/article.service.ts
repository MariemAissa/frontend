// core/services/article.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Article,
  ArticleCreateRequest,
  ArticleResponse,
  ArticlesResponse,
  ArticleByIdResponse
} from '../models/article.model';

export interface GetArticlesParams {
  page?: number;
  limit?: number;
  sort?: string;
  search?: string;
  tags?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class ArticleService {
  private apiUrl = `${environment.apiUrl}/articles`;

  constructor(private http: HttpClient) {}

  createArticle(articleData: ArticleCreateRequest): Observable<ArticleResponse> {
    return this.http.post<ArticleResponse>(this.apiUrl, articleData);
  }

  updateArticle(articleId: string, articleData: ArticleCreateRequest): Observable<ArticleResponse> {
    return this.http.put<ArticleResponse>(`${this.apiUrl}/${articleId}`, articleData);
  }

  deleteArticle(articleId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${articleId}`);
  }

  getArticleById(articleId: string): Observable<ArticleByIdResponse> {
    return this.http.get<ArticleByIdResponse>(`${this.apiUrl}/${articleId}`);
  }

  getArticles(params?: GetArticlesParams): Observable<ArticlesResponse> {
    let httpParams = new HttpParams();

    if (params) {
      if (params.page) httpParams = httpParams.set('page', params.page.toString());
      if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());
      if (params.sort) httpParams = httpParams.set('sort', params.sort);
      if (params.search) httpParams = httpParams.set('search', params.search);
      if (params.tags && params.tags.length > 0) {
        params.tags.forEach(tag => {
          httpParams = httpParams.append('tags', tag);
        });
      }
    }

    return this.http.get<ArticlesResponse>(this.apiUrl, { params: httpParams });
  }

  getUserArticles(): Observable<ArticlesResponse> {
    return this.http.get<ArticlesResponse>(`http://localhost:3000/api/my-articles`);
  }

  likeArticle(articleId: string): Observable<ArticleResponse> {
    return this.http.post<ArticleResponse>(`${this.apiUrl}/${articleId}/like`, {});
  }

  getPopularArticles(): Observable<ArticlesResponse> {
    return this.http.get<ArticlesResponse>(`${this.apiUrl}`, {
      params: { limit: '6', sort: '-viewCount' }
    });
  }
}
