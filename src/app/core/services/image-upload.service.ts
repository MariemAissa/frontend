// core/services/image-upload.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType } from '@angular/common/http';
import {Observable, BehaviorSubject, switchMap} from 'rxjs';
import { environment } from '../../../environments/environment';

export interface UploadResponse {
  success: boolean;
  imageId?: string;
  filename?: string;
  url?: string;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ImageUploadService {
  private apiUrl = `${environment.apiUrl}/images`;

  private uploadProgress = new BehaviorSubject<number>(0);
  public uploadProgress$ = this.uploadProgress.asObservable();

  constructor(private http: HttpClient) {}

  uploadImage(file: File): Observable<UploadResponse> {
    const formData = new FormData();
    formData.append('image', file);

    return new Observable(observer => {
      this.http.post<UploadResponse>(`${this.apiUrl}/upload`, formData, {
        reportProgress: true,
        observe: 'events'
      }).subscribe({
        next: (event: HttpEvent<any>) => {
          if (event.type === HttpEventType.UploadProgress && event.total) {
            const progress = Math.round((100 * event.loaded) / event.total);
            this.uploadProgress.next(progress);
          } else if (event.type === HttpEventType.Response) {
            this.uploadProgress.next(0);
            observer.next(event.body!);
            observer.complete();
          }
        },
        error: (error) => {
          this.uploadProgress.next(0);
          observer.error(error);
        }
      });
    });
  }

  getImageUrl(imageId: string): string {
    return `/${imageId}`;
  }

  deleteImage(imageId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${imageId}`);
  }

  resetProgress(): void {
    this.uploadProgress.next(0);
  }

  // image-upload.service.ts
  getImageAsBase64(imageId: string): Observable<string> {
    return this.http.get(this.getImageUrl(imageId), {
      responseType: 'blob'
    }).pipe(
      switchMap(blob => {
        return new Observable<string>(observer => {
          const reader = new FileReader();
          reader.onload = () => {
            // Enlever le préfixe "data:image/jpeg;base64,"
            const base64 = (reader.result as string).split(',')[1];
            observer.next(base64);
            observer.complete();
          };
          reader.readAsDataURL(blob);
        });
      })
    );
  }
}
