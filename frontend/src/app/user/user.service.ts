import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs'; // Import 'of'
import { catchError } from 'rxjs/operators';
import { User } from '../models/user.model';
import { Booking } from '../models/booking.model';
import { PaymentMethod } from '../models/payment-method.model'; // Import PaymentMethod model
// Import specific profile/preferences models if they exist separately
// import { UserProfile } from '../models/user-profile.model';
// import { UserPreferences } from '../models/user-preferences.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  // Point to the user service API endpoint - assuming a /me convention for current user
  private profileApiUrl = `${environment.apiUrl}/users/profiles/me/`;
  private preferencesApiUrl = `${environment.apiUrl}/users/preferences/me/`;
  private bookingsApiUrl = `${environment.apiUrl}/bookings/bookings/`;
  // TODO: Define actual backend endpoint for payment methods when available
  private paymentMethodsApiUrl = `${environment.apiUrl}/users/payment-methods/me/`; // Placeholder

  // --- Mock Data for Payment Method Simulation ---
  private mockPaymentMethods: PaymentMethod[] = [
    {
      id: 'pm_1',
      type: 'Credit Card',
      last4: '4242',
      expiryMonth: 12,
      expiryYear: 2028,
      isDefault: true,
    },
    { id: 'pm_2', type: 'PayPal', last4: 'user@example.com', isDefault: false }, // Using email/identifier for PayPal last4
  ];
  private nextMockId = 3;
  // --- End Mock Data ---

  constructor(private http: HttpClient) {}

  // Method to get the current user's profile data
  // Assumes the API returns the UserProfile data for the authenticated user via /me/
  getUserProfile(): Observable<User> {
    // Assuming User model holds profile data merged from User and UserProfile
    console.log('UserService: Fetching current user profile');
    return this.http
      .get<User>(this.profileApiUrl) // GET request to /me/ endpoint
      .pipe(catchError(this.handleError));
  }

  // Method to update the current user's profile data
  // Assumes PATCH request to update partial data on the /me/ endpoint
  updateUserProfile(profileData: Partial<User>): Observable<User> {
    console.log('UserService: Updating current user profile', profileData);
    // Construct payload matching the UserProfileSerializer fields expected by backend
    // Exclude fields not in UserProfile model or read-only fields like 'user', 'created_at', 'updated_at'
    // Construct payload matching the UserProfileSerializer fields expected by backend
    // Map frontend camelCase to backend snake_case where necessary
    const updatePayload = {
      first_name: profileData.first_name,
      last_name: profileData.last_name,
      phone_number: profileData.phone_number, // Map phone_number to phone_number
      address_line1: profileData.address_line1,
      address_line2: profileData.address_line2,
      city: profileData.city,
      state: profileData.state,
      postal_code: profileData.postal_code, // Map postal_code to postal_code
      country: profileData.country,
    };
    // Remove undefined fields from payload to avoid sending nulls for unchanged fields
    // Correctly handle TypeScript key typing
    Object.keys(updatePayload).forEach((key) => {
      const typedKey = key as keyof typeof updatePayload;
      if (updatePayload[typedKey] === undefined) {
        delete updatePayload[typedKey];
      }
    });

    return this.http
      .patch<User>(this.profileApiUrl, updatePayload)
      .pipe(catchError(this.handleError));
  }

  // --- Payment Method Simulation Methods ---

  // Method to get simulated payment methods
  getPaymentMethods(): Observable<PaymentMethod[]> {
    console.log('UserService: Fetching simulated payment methods');
    // Simulate API call delay
    return of(this.mockPaymentMethods).pipe(
      // delay(500), // Uncomment to simulate network latency
      catchError(this.handleError) // Keep error handling
    );
    // Replace with actual HTTP call when backend is ready:
    // return this.http.get<PaymentMethod[]>(this.paymentMethodsApiUrl).pipe(catchError(this.handleError));
  }

  // Method to add a simulated payment method
  addPaymentMethod(
    methodData: Omit<PaymentMethod, 'id'>
  ): Observable<PaymentMethod> {
    console.log('UserService: Adding simulated payment method', methodData);
    const newMethod: PaymentMethod = {
      ...methodData,
      id: `pm_${this.nextMockId++}`, // Generate temporary ID
      isDefault: this.mockPaymentMethods.length === 0, // Make first added default
    };
    // If making this new one default, unset others
    if (newMethod.isDefault) {
      this.mockPaymentMethods.forEach((pm) => (pm.isDefault = false));
    }
    this.mockPaymentMethods.push(newMethod);
    // Simulate API call delay and return the newly created method
    return of(newMethod).pipe(
      // delay(500),
      catchError(this.handleError)
    );
    // Replace with actual HTTP call when backend is ready:
    // return this.http.post<PaymentMethod>(this.paymentMethodsApiUrl, methodData).pipe(catchError(this.handleError));
  }

  // Method to remove a simulated payment method
  deletePaymentMethod(methodId: number | string): Observable<void> {
    console.log('UserService: Deleting simulated payment method ID:', methodId);
    const index = this.mockPaymentMethods.findIndex((pm) => pm.id === methodId);
    if (index > -1) {
      const wasDefault = this.mockPaymentMethods[index].isDefault;
      this.mockPaymentMethods.splice(index, 1);
      // If the deleted one was default, make the first remaining one default (if any)
      if (wasDefault && this.mockPaymentMethods.length > 0) {
        this.mockPaymentMethods[0].isDefault = true;
      }
    }
    // Simulate API call delay and return success (void)
    return of(undefined).pipe(
      // delay(500),
      catchError(this.handleError)
    );
    // Replace with actual HTTP call when backend is ready:
    // return this.http.delete<void>(`${this.paymentMethodsApiUrl}${methodId}/`).pipe(catchError(this.handleError));
  }

  // Method to set a default payment method (simulation)
  setDefaultPaymentMethod(methodId: number | string): Observable<void> {
    console.log('UserService: Setting default payment method ID:', methodId);
    this.mockPaymentMethods.forEach((pm) => {
      pm.isDefault = pm.id === methodId;
    });
    return of(undefined).pipe(
      // delay(200),
      catchError(this.handleError)
    );
    // Replace with actual HTTP call when backend is ready (might be part of update or a specific action)
    // return this.http.patch<void>(`${this.paymentMethodsApiUrl}${methodId}/set_default/`, {}).pipe(catchError(this.handleError));
  }

  // --- End Payment Method Simulation ---

  // Method to get user preferences (assuming /me endpoint)
  // getUserPreferences(): Observable<UserPreferences> {
  //   console.log('UserService: Fetching preferences for current user');
  //   return this.http.get<UserPreferences>(this.preferencesApiUrl).pipe(
  //     catchError(this.handleError)
  //   );
  // }

  // Method to update user preferences (assuming /me endpoint)
  // updateUserPreferences(preferencesData: Partial<UserPreferences>): Observable<UserPreferences> {
  //   console.log('UserService: Updating preferences for current user', preferencesData);
  //   return this.http.patch<UserPreferences>(this.preferencesApiUrl, preferencesData).pipe(
  //     catchError(this.handleError)
  //   );
  // }

  // Method to get the current user's booking history
  getUserBookings(): Observable<Booking[]> {
    console.log('UserService: Fetching user bookings');
    // Assumes the booking service endpoint filters by authenticated user
    return this.http
      .get<Booking[]>(this.bookingsApiUrl)
      .pipe(catchError(this.handleError));
  }

  // Basic error handler
  private handleError(error: any): Observable<never> {
    console.error('API Error in UserService:', error);
    // Customize error message based on error status or type if needed
    let message = 'Failed to process user data; please try again later.';
    if (error.status === 401 || error.status === 403) {
      message = 'Authentication error. Please log in again.';
    } else if (error.status === 404) {
      message = 'User profile or resource not found.';
    } else if (error.status === 400) {
      message = `Invalid data submitted: ${
        error.error?.detail || 'Please check your input.'
      }`;
    }
    return throwError(() => new Error(message));
  }
}
