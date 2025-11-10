import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {Comment, CommentCreateRequest, CommentResponse} from '../models/comment.model';

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/comments`;

  getArticleComments(articleId: string): Observable<CommentResponse> {
    return this.http.get<CommentResponse>(`${this.apiUrl}/article/${articleId}`);
  }

  createComment(commentData: CommentCreateRequest): Observable<Comment> {
    return this.http.post<Comment>(this.apiUrl, commentData);
  }

  updateComment(commentId: string, content: string): Observable<Comment> {
    return this.http.patch<Comment>(`${this.apiUrl}/${commentId}`, { content });
  }

  deleteComment(commentId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${commentId}`);
  }

  likeComment(commentId: string): Observable<Comment> {
    return this.http.post<Comment>(`${this.apiUrl}/${commentId}/like`, {});
  }
}
