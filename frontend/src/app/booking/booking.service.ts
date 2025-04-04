import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'; // Import HttpClient
import { Observable, of, throwError } from 'rxjs'; // Import Observable, of, throwError
import { catchError } from 'rxjs/operators'; // Import catchError
import { Booking } from '../models/booking.model'; // Import Booking model
import { environment } from '../../environments/environment'; // Import environment

@Injectable({
  providedIn: 'root',
})
export class BookingService {
  // Point to the booking service API endpoint
  private bookingsApiUrl = `${environment.apiUrl}/bookings/bookings/`; // Matches booking_service urls.py

  constructor(private http: HttpClient) {}

  // Method to create a new booking
  // Needs payload matching backend expectations (room_type ID, dates, guests)
  // User ID is set automatically by the backend based on authentication
  createBooking(bookingData: {
    roomTypeId: number;
    checkInDate: string; // YYYY-MM-DD
    checkOutDate: string; // YYYY-MM-DD
    numGuests: number;
    totalPrice: number; // Assuming price is calculated frontend or passed through
    // Optional: Add guest details if backend handles nested creation
    // guests?: { first_name: string; last_name: string; isPrimary: boolean }[];
  }): Observable<Booking> {
    console.log('BookingService: Creating booking with data:', bookingData);
    // The backend perform_create handles setting the user.
    // Backend might also recalculate price and check availability.
    // Construct payload matching the BookingSerializer fields expected by backend
    const payload = {
      room_type: bookingData.roomTypeId, // Send RoomType ID
      check_in_date: bookingData.checkInDate,
      check_out_date: bookingData.checkOutDate,
      num_guests: bookingData.numGuests,
      total_price: bookingData.totalPrice, // Send price calculated/confirmed by frontend
      status: 'PENDING', // Default status for new booking
      // guests: bookingData.guests // Uncomment if sending nested guest data and backend supports it
    };
    return this.http
      .post<Booking>(this.bookingsApiUrl, payload) // Send the constructed payload
      .pipe(catchError(this.handleError));
  } // Added missing closing brace for createBooking

  // Method to get booking details by ID or reference
  getBookingDetails(bookingId: number | string): Observable<Booking> {
    console.log('BookingService: Fetching details for booking:', bookingId);
    // Adjust URL based on whether using ID or reference
    return this.http
      .get<Booking>(`${this.bookingsApiUrl}${bookingId}/`)
      .pipe(catchError(this.handleError));
  }

  // Method to get bookings for the current user
  getUserBookings(): Observable<Booking[]> {
    console.log('BookingService: Fetching bookings for current user');
    // Assumes the backend /api/bookings/bookings/ endpoint filters by authenticated user
    return this.http
      .get<Booking[]>(this.bookingsApiUrl)
      .pipe(catchError(this.handleError));
  }

  // Method to cancel a booking
  cancelBooking(bookingId: number): Observable<any> {
    console.log('BookingService: Cancelling booking:', bookingId);
    // Backend might require PATCH with status update or a dedicated cancel endpoint
    return this.http
      .patch<any>(`${this.bookingsApiUrl}${bookingId}/`, {
        status: 'CANCELLED',
      })
      .pipe(catchError(this.handleError));
    // Or: return this.http.post<any>(`${this.bookingsApiUrl}${bookingId}/cancel/`, {}).pipe(...)
  }

  // Basic error handler
  private handleError(error: any): Observable<never> {
    console.error('API Error in BookingService:', error);
    return throwError(
      () =>
        new Error('Failed to process booking request; please try again later.')
    );
  }
}
