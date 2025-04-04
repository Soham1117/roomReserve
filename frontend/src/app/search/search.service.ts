import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http'; // Import HttpClient, HttpParams
import { Observable, of, throwError } from 'rxjs'; // Import Observable, of, throwError
import { catchError } from 'rxjs/operators'; // Import catchError
import { Hotel } from '../models/hotel.model'; // Import Hotel model
import { Room } from '../models/room.model'; // Import Room model
import { Review } from '../models/review.model'; // Import Review model
import { environment } from '../../environments/environment'; // Import environment

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  // Define API URLs based on backend structure
  private hotelsApiUrl = `${environment.apiUrl}/hotels/hotels/`; // Matches hotel_service urls.py for HotelViewSet
  private roomTypesApiUrl = `${environment.apiUrl}/hotels/roomtypes/`; // Matches hotel_service urls.py for RoomTypeViewSet
  private reviewsApiUrl = `${environment.apiUrl}/reviews/reviews/`; // Matches review_service urls.py for ReviewViewSet (assuming)

  constructor(private http: HttpClient) {}

  // Method to search for hotels based on criteria
  searchHotels(searchParams: {
    destination?: string;
    checkIn?: string; // YYYY-MM-DD format - Complex: Requires availability check
    checkOut?: string; // YYYY-MM-DD format - Complex: Requires availability check
    guests?: number; // Complex: Requires room capacity check
    minRating?: number;
    amenities?: string[]; // e.g., ['wifi', 'pool'] -> amenities__in=wifi,pool
    priceMin?: number;
    priceMax?: number;
    sortBy?: 'price' | 'rating' | 'name'; // Add more as needed
    sortOrder?: 'asc' | 'desc';
  }): Observable<Hotel[]> {
    console.log('SearchService: Searching hotels with params:', searchParams);

    // Build query parameters
    let params = new HttpParams();
    if (searchParams.destination) {
      // Assumes backend supports generic search on name, city, etc.
      params = params.set('search', searchParams.destination);
    }
    if (searchParams.guests) {
      // Backend needs to support filtering by capacity - Complex, skipping for now
      // params = params.set('min_capacity', searchParams.guests.toString());
    }
    // Date filtering requires checking RoomAvailability - Complex, skipping for now
    // if (searchParams.checkIn && searchParams.checkOut) { ... }

    // Add new filters
    if (searchParams.minRating !== undefined) {
      // Backend filter expects 'star_rating__gte' based on filterset_fields
      params = params.set(
        'star_rating__gte',
        searchParams.minRating.toString()
      );
    }
    if (searchParams.amenities && searchParams.amenities.length > 0) {
      // Assumes backend supports filtering like 'amenities__name__in' or similar
      // Adjust 'amenities__name__in' based on actual backend implementation
      params = params.set(
        'amenities__name__in',
        searchParams.amenities.join(',')
      );
    }
    if (searchParams.priceMin !== undefined) {
      // Assumes backend supports filtering like 'price__gte' (needs price field on Hotel or RoomType)
      params = params.set('price__gte', searchParams.priceMin.toString());
    }
    if (searchParams.priceMax !== undefined) {
      // Assumes backend supports filtering like 'price__lte'
      params = params.set('price__lte', searchParams.priceMax.toString());
    }

    // Add sorting
    if (searchParams.sortBy) {
      // Map frontend 'rating' to backend 'star_rating'
      let backendSortField: string = searchParams.sortBy; // Explicitly type as string
      if (backendSortField === 'rating') {
        backendSortField = 'star_rating';
      }
      // Note: Sorting by 'price' is not supported by backend currently

      const sortParam =
        searchParams.sortOrder === 'desc'
          ? `-${backendSortField}`
          : backendSortField;
      // Backend filter expects 'ordering' based on OrderingFilter
      params = params.set('ordering', sortParam);
    }

    // The backend ViewSet needs to implement filtering/ordering based on these params.
    console.log(
      'SearchService: Sending request with params:',
      params.toString()
    );
    return this.http
      .get<Hotel[]>(this.hotelsApiUrl, { params })
      .pipe(catchError(this.handleError));
  }

  // Method to get details for a specific hotel
  getHotelDetails(hotelId: number): Observable<Hotel> {
    console.log('SearchService: Fetching details for hotel ID:', hotelId);
    return this.http
      .get<Hotel>(`${this.hotelsApiUrl}${hotelId}/`)
      .pipe(catchError(this.handleError));
  }

  // Method to fetch room types for a specific hotel
  getRoomsForHotel(hotelId: number): Observable<Room[]> {
    console.log('SearchService: Fetching rooms for hotel ID:', hotelId);
    // Assumes backend filters room types by hotel query parameter
    const params = new HttpParams().set('hotel', hotelId.toString()); // Use 'hotel' based on RoomTypeSerializer field
    return this.http
      .get<Room[]>(this.roomTypesApiUrl, { params })
      .pipe(catchError(this.handleError));
  }

  // Method to get details for a specific room type
  getRoomTypeDetails(roomTypeId: number): Observable<Room> {
    console.log(
      'SearchService: Fetching details for room type ID:',
      roomTypeId
    );
    return this.http
      .get<Room>(`${this.roomTypesApiUrl}${roomTypeId}/`)
      .pipe(catchError(this.handleError));
  }

  // Method to fetch reviews for a specific hotel
  getReviewsForHotel(hotelId: number): Observable<Review[]> {
    console.log('SearchService: Fetching reviews for hotel ID:', hotelId);
    // Assumes backend filters reviews by hotel query parameter
    const params = new HttpParams().set('hotel', hotelId.toString()); // Use 'hotel' based on Review model FK
    return this.http
      .get<Review[]>(this.reviewsApiUrl, { params })
      .pipe(catchError(this.handleError));
  }

  // Basic error handler
  private handleError(error: any): Observable<never> {
    console.error('API Error in SearchService:', error);
    // Customize error message based on error status or type if needed
    let message = 'Failed to fetch data; please try again later.';
    if (error.status === 404) {
      message = 'Requested resource not found.';
    } else if (error.status === 500) {
      message = 'Server error; please contact support.';
    }
    return throwError(() => new Error(message));
  }
}
