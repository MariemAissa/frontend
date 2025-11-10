import { HttpInterceptorFn, HttpErrorResponse, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, switchMap, throwError, BehaviorSubject, filter, take } from 'rxjs';
import { AuthService } from '../services/auth.service';

// Variables globales pour gérer le refresh token
let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Récupérer le token
  const token = authService.getToken();

  // Cloner la requête et ajouter le header Authorization
  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Gérer les erreurs 401 (Unauthorized)
      if (error.status === 401 && token) {
        return handle401Error(authReq, next, authService, router);
      }

      // Rediriger vers login pour les autres erreurs d'authentification
      if (error.status === 401 || error.status === 403) {
        authService.logout();
        router.navigate(['/login']);
      }

      return throwError(() => error);
    })
  );
};

function handle401Error(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  authService: AuthService,
  router: Router
): Observable<HttpEvent<unknown>> {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    return authService.refreshToken().pipe(
      switchMap((response: any) => {
        isRefreshing = false;

        if (response.success) {
          authService.setTokens(response.token, response.refreshToken);
          refreshTokenSubject.next(response.token);

          // Répéter la requête originale avec le nouveau token
          const authReq = req.clone({
            setHeaders: {
              Authorization: `Bearer ${response.token}`
            }
          });
          return next(authReq);
        } else {
          authService.logout();
          router.navigate(['/login']);
          return throwError(() => new Error('Refresh token failed'));
        }
      }),
      catchError((error) => {
        isRefreshing = false;
        authService.logout();
        router.navigate(['/login']);
        return throwError(() => error);
      })
    );
  } else {
    return refreshTokenSubject.pipe(
      filter((token): token is string => token !== null),
      take(1),
      switchMap(token => {
        const authReq = req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        });
        return next(authReq);
      })
    );
  }
}
