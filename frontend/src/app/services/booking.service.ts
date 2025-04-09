import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { HttpParams } from '@angular/common/http'; // Import HttpParams if needed for GET

// Interface for the data expected by the backend create endpoint
export interface BookedRoomPayload {
  room_type: number; // RoomType ID
  quantity: number;
}

export interface BookingGuestPayload {
  first_name?: string;
  last_name?: string;
  is_primary: boolean;
}

export interface BookingCreatePayload {
  check_in_date: string; // Format: YYYY-MM-DD
  check_out_date: string; // Format: YYYY-MM-DD
  num_guests: number; // Total guests
  special_requests?: string;
  booked_rooms: BookedRoomPayload[]; // Array of rooms and quantities
  guests: BookingGuestPayload[]; // Array of guest details
  // total_price is now calculated backend-side
  // status defaults to PENDING backend-side
}

// Interface for reading booked room details
export interface BookedRoomDetail {
  id: number;
  room_type: number;
  room_type_name: string;
  quantity: number;
  price_at_booking: number;
}

// Interface for the expected booking response (adjust based on actual backend response)
export type BookingResponse = {
  id: number;
  booking_reference: string;
  user: string;
  check_in_date: string;
  check_out_date: string;
  num_guests: number;
  total_price: string;
  status_code: string;
  special_requests?: string;
  booked_rooms_details: BookedRoomDetail[];
  guests: BookingGuestPayload[];
  created_at: string;
  updated_at: string;
};

@Injectable({
  providedIn: 'root',
})
export class BookingService {
  private apiUrl = `${environment.apiUrl}/bookings/bookings`;

  constructor(private http: HttpClient) {}

  /**
   * Creates a new booking.
   * @param bookingData - The data required to create a booking.
   * @returns Observable<BookingResponse>
   */
  createBooking(bookingData: BookingCreatePayload): Observable<BookingResponse> {
    return this.http.post<BookingResponse>(`${this.apiUrl}/`, bookingData);
  }

  /**
   * Retrieves details for a specific booking.
   * @param id - The ID of the booking to retrieve.
   * @returns Observable<BookingResponse>
   */
  getBookingById(id: number): Observable<BookingResponse> {
    return this.http.get<BookingResponse>(`${this.apiUrl}/${id}/`);
  }

  getBookingByReference(reference: string): Observable<BookingResponse[]> {
    return this.http.get<BookingResponse[]>(`${this.apiUrl}/?booking_reference=${reference}`);
  }

  /**
   * Confirms the payment for a booking, updating its status.
   * @param id - The ID of the booking to confirm.
   * @returns Observable<BookingResponse>
   */
  confirmPayment(id: number): Observable<BookingResponse> {
    return this.http.patch<BookingResponse>(`${this.apiUrl}/${id}/`, {
      status_code: 'CONFIRMED',
    });
  }

  confirmPaymentByReference(reference: string): Observable<BookingResponse> {
    return this.http.patch<BookingResponse>(`${this.apiUrl}/?booking_reference=${reference}`, {
      status_code: 'CONFIRMED',
    });
  }

  /**
   * Calls the backend confirm_payment action endpoint.
   * @param bookingId - Numeric booking ID
   */
  confirmPaymentAction(bookingId: number): Observable<BookingResponse> {
    return this.http.post<BookingResponse>(`${this.apiUrl}/${bookingId}/confirm_payment/`, {});
  }
}
