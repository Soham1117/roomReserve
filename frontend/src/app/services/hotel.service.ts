import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators'; // Import operators
import { Hotel } from '../models/hotel.model'; // Assuming Hotel model exists
import { environment } from '../../environments/environment.development'; // Import environment variable
@Injectable({
  providedIn: 'root',
})
export class HotelService {
  private apiUrl = environment.apiUrl + '/hotels/hotels/'; // Base URL for hotel service endpoints

  constructor(private http: HttpClient) {}

  // Method to search hotels based on destination
  searchHotels(destination: string): Observable<Hotel[]> {
    let params = new HttpParams();
    if (destination) {
      params = params.set('search', destination);
    }

    const requestUrl = `${this.apiUrl}?${params.toString()}`;
    console.log('HotelService: Requesting URL:', requestUrl); // Log the full URL

    // Use the full apiUrl constructed with params, not just the base apiUrl
    return this.http.get<Hotel[]>(requestUrl).pipe(
      tap((data) => console.log('HotelService: Received data:', data)), // Log successful response
      catchError((error) => {
        console.error('HotelService: API call failed:', error); // Log the error object
        // Optionally re-throw the error or return a user-friendly error observable
        return throwError(() => new Error('API call failed in HotelService'));
      })
    );
  }

  // Method to get a single hotel by its ID
  getHotelById(id: number): Observable<Hotel> {
    const requestUrl = `${this.apiUrl}${id}/`; // Construct URL like /api/v1/hotels/123/
    console.log('HotelService: Requesting URL:', requestUrl);

    return this.http.get<Hotel>(requestUrl).pipe(
      tap((data) => console.log(`HotelService: Received hotel ${id}:`, data)),
      catchError((error) => {
        console.error(`HotelService: API call failed for hotel ${id}:`, error);
        return throwError(() => new Error(`API call failed for hotel ${id} in HotelService`));
      })
    );
  }

  // Add other methods later (e.g., getAmenities, etc.)
}
