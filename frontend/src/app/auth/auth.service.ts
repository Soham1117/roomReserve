import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { tap, catchError, switchMap, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { User } from '../models/user.model';
import { UserService } from '../user/user.service'; // Import UserService
// Optionally use a JWT decoding library
// import { jwtDecode } from 'jwt-decode'; // Example library

// Interfaces for token response
interface TokenResponse {
  access: string;
  refresh?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`; // Base URL for auth service endpoints
  private tokenKey = 'accessToken';
  private refreshTokenKey = 'refreshToken';

  // Use BehaviorSubject to manage current user state reactively
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  // Inject UserService
  constructor(private http: HttpClient, private userService: UserService) {
    // Load initial state on service initialization
    this.loadInitialAuthState();
  }

  private loadInitialAuthState(): void {
    const token = localStorage.getItem(this.tokenKey);
    if (token && !this.isTokenExpired(token)) {
      // If token exists and is not expired, fetch user profile
      this.fetchAndSetCurrentUser();
    } else {
      // Otherwise, ensure user state is null
      this.clearUserState();
    }
  }

  login(credentials: { username: string; password: string }): Observable<any> {
    console.log('AuthService: Attempting login with:', credentials);
    // Construct URL manually, ignoring environment.apiUrl version prefix for token endpoint
    const tokenUrl =
      environment.apiUrl.replace('/api/v1', '/api') + '/auth/token/'; // Go up one level from /api/v1 to /api
    console.log('AuthService: Using token URL:', tokenUrl);
    return this.http.post<TokenResponse>(tokenUrl, credentials).pipe(
      tap((response) => {
        if (response && response.access) {
          this.storeTokens(response.access, response.refresh);
          console.log('Login successful, token stored.');
          // Fetch user details after successful login
          this.fetchAndSetCurrentUser();
        } else {
          console.error('Login failed: No access token received');
          this.clearUserState();
        }
      }),
      catchError(this.handleError)
    );
  }

  register(userData: Partial<User>): Observable<User> {
    console.log('AuthService: Attempting registration with:', userData);

    // POST to the UserViewSet create endpoint (assuming it's under /api/auth/users/)
    return this.http.post<User>(`${this.apiUrl}/users/`, userData).pipe(
      tap((user) => console.log('Registration successful:', user)),
      // Consider logging the user in automatically after registration
      catchError(this.handleError)
    );
  }

  logout(): void {
    console.log('AuthService: Logging out');
    this.clearUserState();
    // TODO: Optionally call a backend logout/token blacklist endpoint if implemented
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem(this.tokenKey);
    return !!token && !this.isTokenExpired(token);
  }

  // Get current user details from the BehaviorSubject
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  // Fetch user profile using UserService and update the BehaviorSubject
  private fetchAndSetCurrentUser(): void {
    // Assuming UserService has getUserProfile that fetches the current user's profile
    this.userService.getUserProfile().subscribe({
      next: (user) => {
        this.currentUserSubject.next(user);
        console.log('Current user profile fetched:', user);
      },
      error: (err) => {
        console.error('Failed to fetch user profile after login/refresh:', err);
        // If fetching fails (e.g., token invalid), log out
        this.logout();
      },
    });
  }

  // Helper to store tokens
  private storeTokens(accessToken: string, refreshToken?: string): void {
    localStorage.setItem(this.tokenKey, accessToken);
    if (refreshToken) {
      localStorage.setItem(this.refreshTokenKey, refreshToken);
    }
  }

  // Helper to clear user state and tokens
  private clearUserState(): void {
    this.currentUserSubject.next(null);
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    console.log('User state and tokens cleared.');
  }

  // Basic token expiry check (can be enhanced with a library)
  private isTokenExpired(token: string): boolean {
    try {
      // Basic check: Decode payload (assuming standard JWT structure)
      const payloadBase64 = token.split('.')[1];
      const decodedJson = atob(payloadBase64);
      const decoded = JSON.parse(decodedJson);
      const expiry = decoded.exp; // Expiration time in seconds since epoch
      const now = Math.floor(new Date().getTime() / 1000);
      return now >= expiry;
    } catch (e) {
      console.error('Error decoding token:', e);
      return true; // Treat decoding errors as expired/invalid
    }
  }

  // Basic error handler
  private handleError(error: any): Observable<never> {
    console.error('API Error in AuthService:', error);
    let message = 'Authentication failed; please try again later.';
    if (error.status === 401) {
      message = 'Invalid username or password.';
    } else if (error.status === 400) {
      // Handle registration errors (e.g., username taken)
      message = `Registration failed: ${
        error.error?.username || error.error?.email || 'Invalid data.'
      }`;
    }
    return throwError(() => new Error(message));
  }

  // Optional: Add token refresh logic here later
}
