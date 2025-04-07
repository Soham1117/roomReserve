import { Injectable } from '@angular/core'; // Removed inject
import { HttpClient, HttpErrorResponse } from '@angular/common/http'; // Added HttpErrorResponse
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { tap, catchError, switchMap, map, filter, take } from 'rxjs/operators'; // Added filter, take
import { environment } from '../../environments/environment';
import { Injector } from '@angular/core'; // Import Injector
import { User } from '../models/user.model';
import { UserService } from '../user/user.service'; // Keep import for type usage
import { Router } from '@angular/router';

// Interfaces for token response
interface TokenResponse {
  access: string;
  refresh?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private tokenUrl = environment.apiUrl.replace('/api/v1', '/api') + '/auth/token/'; // Corrected token URL
  private refreshUrl = environment.apiUrl.replace('/api/v1', '/api') + '/auth/token/refresh/'; // Added refresh URL
  private tokenKey = 'accessToken';
  private refreshTokenKey = 'refreshToken';

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private isRefreshing = false; // Flag to prevent multiple refresh attempts
  private refreshTokenSubject = new BehaviorSubject<any>(null);

  // Inject Injector instead of UserService directly
  constructor(
    private http: HttpClient,
    private router: Router,
    private injector: Injector // Inject Injector
  ) {
    // Use setTimeout to delay initial auth load slightly, allowing other services to instantiate
    // This helps break potential timing issues in dependency resolution at startup
    setTimeout(() => this.loadInitialAuthState(), 0);
  }

  private loadInitialAuthState(): void {
    const accessToken = this.getAccessToken();
    const refreshToken = this.getRefreshToken();

    if (accessToken && !this.isTokenExpired(accessToken)) {
      // Valid access token exists, fetch user profile
      console.log('AuthService: Valid access token found, fetching user profile.');
      this.fetchAndSetCurrentUser();
    } else if (refreshToken) {
      // Access token is missing or expired, but refresh token exists
      console.log('AuthService: Access token expired or missing, attempting refresh...');
      // Important: Don't mark as refreshing here, let refreshToken() handle the flag
      this.refreshToken().subscribe({
        next: () => {
          console.log('AuthService: Refresh successful on init, fetching user profile.');
          // After successful refresh, the interceptor won't run for the initial profile fetch,
          // so we need to trigger it manually *after* the new token is stored by refreshToken().
          this.fetchAndSetCurrentUser();
        },
        error: (err) => {
          console.error('AuthService: Refresh on init failed:', err.message);
          // Clear state if refresh fails
          this.clearUserState();
        },
      });
    } else {
      // No valid tokens found
      console.log('AuthService: No valid tokens found on init.');
      this.clearUserState();
    }
  }

  login(credentials: { username: string; password: string }): Observable<any> {
    console.log('AuthService: Attempting login with:', credentials.username);
    return this.http.post<TokenResponse>(this.tokenUrl, credentials).pipe(
      tap((response) => {
        if (response?.access) {
          this.storeTokens(response.access, response.refresh);
          console.log('Login successful, token stored.');
          // Fetch user details after successful login
          this.fetchAndSetCurrentUser();
        } else {
          console.error('Login failed: No access token received');
          this.clearUserState();
        }
      }),
      catchError((err) => this.handleLoginError(err)) // Use specific login error handler
    );
  }

  register(userData: Partial<User>): Observable<User> {
    console.log('AuthService: Attempting registration with:', userData.username);
    // POST to the UserViewSet create endpoint
    return this.http.post<User>(`${this.apiUrl}/users/`, userData).pipe(
      tap((user) => console.log('Registration successful:', user)),
      catchError((err) => this.handleRegistrationError(err)) // Use specific registration error handler
    );
  }

  logout(): void {
    console.log('AuthService: Logging out');
    this.clearUserState();
    // TODO: Optionally call a backend logout/token blacklist endpoint
  }

  // Check if authenticated based on valid access token
  isAuthenticated(): boolean {
    const token = this.getAccessToken();
    return !!token && !this.isTokenExpired(token);
  }

  // Get current user details from the BehaviorSubject
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  private getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey);
  }

  // Fetch user profile using UserService (obtained via Injector) and update the BehaviorSubject
  private fetchAndSetCurrentUser(): void {
    const token = this.getAccessToken();
    if (!token) {
      console.log('No access token found, cannot fetch user profile.');
      this.clearUserState();
      return;
    }

    // Get UserService instance manually using Injector inside the method
    const userService = this.injector.get(UserService);

    userService.getUserProfile().subscribe({
      next: (user) => {
        this.currentUserSubject.next(user);
      },
      error: (err) => {
        console.error('Failed to fetch user profile:', err);
        // If fetching fails (e.g., token invalid/expired and refresh failed), log out
        this.logout(); // Consider calling logout which clears state
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

  // Specific error handler for login
  private handleLoginError(error: HttpErrorResponse): Observable<never> {
    console.error('Login API Error:', error);
    let message = 'Login failed. Please check your credentials or try again later.';
    if (error.status === 401) {
      message = 'Invalid username or password.';
    } else if (error.error?.detail) {
      message = error.error.detail; // Use detailed message from backend if available
    }
    this.clearUserState(); // Clear state on login failure
    return throwError(() => new Error(message));
  }

  // Specific error handler for registration
  private handleRegistrationError(error: HttpErrorResponse): Observable<never> {
    console.error('Registration API Error:', error);
    let message = 'Registration failed. Please try again later.';
    if (error.status === 400 && error.error) {
      // Extract specific field errors if available from DRF
      const errors = error.error;
      if (errors.username) message = `Username: ${errors.username.join(' ')}`;
      else if (errors.email) message = `Email: ${errors.email.join(' ')}`;
      else if (errors.password) message = `Password: ${errors.password.join(' ')}`;
      else message = 'Registration failed: Invalid data provided.';
    } else if (error.error?.detail) {
      message = error.error.detail;
    }
    return throwError(() => new Error(message));
  }

  // Token Refresh Logic
  refreshToken(): Observable<any> {
    if (this.isRefreshing) {
      // If already refreshing, wait for the result
      return this.refreshTokenSubject.pipe(
        filter((token) => token !== null),
        take(1)
      );
    }

    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      console.log('No refresh token available.');
      this.logout(); // Ensure logged out if no refresh token
      return throwError(() => new Error('No refresh token available'));
    }

    this.isRefreshing = true;
    this.refreshTokenSubject.next(null); // Signal that refresh is in progress

    return this.http.post<TokenResponse>(this.refreshUrl, { refresh: refreshToken }).pipe(
      tap((response) => {
        this.isRefreshing = false;
        if (response?.access) {
          this.storeTokens(response.access); // Store only the new access token
          this.refreshTokenSubject.next(response.access); // Notify waiting requests
          console.log('Token refreshed successfully.');
          // Optionally re-fetch user profile if needed, but interceptor handles retrying original request
        } else {
          console.error('Token refresh failed: No access token received in response.');
          this.logout(); // Logout if refresh fails definitively
        }
      }),
      catchError((error) => {
        this.isRefreshing = false;
        console.error('Token refresh failed:', error);
        this.logout(); // Logout if refresh request fails
        return throwError(() => new Error('Session expired. Please log in again.'));
      })
    );
  }
}
