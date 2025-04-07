import { Injectable, Injector } from '@angular/core'; // Combined imports
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http'; // Combined imports
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, switchMap, filter, take } from 'rxjs/operators';
import { AuthService } from './auth.service'; // Keep for type usage
import { environment } from '../../environments/environment';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  // Inject Injector instead of AuthService
  constructor(private injector: Injector) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Get AuthService instance via injector
    const authService = this.injector.get(AuthService);
    const token = authService.getAccessToken();
    const isApiUrl = request.url.startsWith(environment.apiUrl);

    if (token && isApiUrl) {
      request = this.addToken(request, token);
    }

    return next.handle(request).pipe(
      catchError((error) => {
        // Handle 401 Unauthorized errors (likely expired token)
        if (error instanceof HttpErrorResponse && error.status === 401 && isApiUrl && token) {
          return this.handle401Error(request, next);
        }
        // For other errors, just pass them through
        return throwError(() => error);
      })
    );
  }

  // Adds the JWT token to the request header
  private addToken(request: HttpRequest<any>, token: string) {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // Handles 401 errors by attempting to refresh the token
  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Get AuthService instance via injector
    const authService = this.injector.get(AuthService);

    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return authService.refreshToken().pipe(
        switchMap((tokenResponse: any) => {
          this.isRefreshing = false;
          const newAccessToken = tokenResponse?.access || tokenResponse;
          if (newAccessToken) {
            this.refreshTokenSubject.next(newAccessToken);
            console.log('Interceptor: Token refreshed, retrying original request.');
            return next.handle(this.addToken(request, newAccessToken));
          } else {
            console.log('Interceptor: Refresh attempt failed (no new token), logging out.');
            authService.logout();
            return throwError(() => new Error('Session expired after refresh attempt.'));
          }
        }),
        catchError((error) => {
          this.isRefreshing = false;
          console.log('Interceptor: Refresh token failed, logging out.');
          authService.logout();
          return throwError(() => error);
        })
      );
    } else {
      // If already refreshing, wait for the new token
      return this.refreshTokenSubject.pipe(
        filter((token) => token != null),
        take(1),
        switchMap((jwt) => {
          console.log(
            'Interceptor: Refresh completed by another request, retrying with new token.'
          );
          return next.handle(this.addToken(request, jwt));
        }),
        catchError((error) => {
          console.log('Interceptor: Waiting for refresh failed, logging out.');
          authService.logout(); // Ensure logout if waiting fails
          return throwError(() => error);
        })
      );
    }
  }
}
