import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface BookingCreatePayload {
  room_type: number;
  check_in_date: string;
  check_out_date: string;
  num_guests: number;
  total_price: number;
  status?: string;
  guests?: { first_name?: string; last_name?: string; is_primary: boolean }[];
}

export interface BookingResponse {
  id: number;
  booking_reference: string;
  [key: string]: any;
}

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
}
