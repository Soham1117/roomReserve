import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment'; // Import environment

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor() {} // Inject AuthService if needed for more complex logic

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Get the token from localStorage (or from AuthService state)
    const token = localStorage.getItem('accessToken');
    const isApiUrl = request.url.startsWith(environment.apiUrl); // Check if request is to our API

    // If token exists and it's an API request, add the Authorization header
    if (token && isApiUrl) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
    }

    return next.handle(request);
    // TODO: Add logic here later to handle 401 errors and attempt token refresh
  }
}
