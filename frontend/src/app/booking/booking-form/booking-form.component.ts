import { Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router'; // Import ActivatedRoute, Router
import { BookingService } from '../booking.service'; // Import BookingService
import { Booking } from '../../models/booking.model'; // Import Booking model
import { SearchService } from '../../search/search.service'; // Import SearchService
import { Room } from '../../models/room.model'; // Import Room model
import { HttpErrorResponse } from '@angular/common/http';
import { switchMap, tap, catchError } from 'rxjs/operators'; // Import operators
import { of, throwError } from 'rxjs'; // Import of and throwError

// Interface for the booking details expected from query params or state
interface BookingDetails {
  hotelId: number;
  roomTypeId: number;
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  guests: number;
  // Fields fetched from services
  hotelName?: string; // Ideally fetched or passed via state
  roomTypeName?: string;
  pricePerNight?: number; // Base price or override for the dates
  totalPrice?: number; // Calculated total
}

@Component({
  selector: 'app-booking-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './booking-form.component.html',
  styleUrls: ['./booking-form.component.css'], // Corrected property name
})
export class BookingFormComponent implements OnInit {
  bookingDetails: BookingDetails | null = null;
  guestDetails = {
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
  };
  isLoading = true; // Start in loading state
  errorMessage: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookingService: BookingService,
    private searchService: SearchService // Inject SearchService
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.route.queryParams
      .pipe(
        tap((params) => {
          // Basic validation and type conversion
          const hotelId = params['hotelId'] ? +params['hotelId'] : null;
          const roomTypeId = params['roomTypeId'] ? +params['roomTypeId'] : null;
          const checkIn = params['checkIn'];
          const checkOut = params['checkOut'];
          const guests = params['guests'] ? +params['guests'] : null;

          if (!(hotelId && roomTypeId && checkIn && checkOut && guests)) {
            throw new Error('Missing booking details in query parameters');
          }

          this.bookingDetails = {
            hotelId: hotelId,
            roomTypeId: roomTypeId,
            checkIn: checkIn,
            checkOut: checkOut,
            guests: guests,
            hotelName: 'Loading...', // Placeholder while fetching
            roomTypeName: 'Loading...', // Placeholder while fetching
          };
          console.log('Initial booking details from params:', this.bookingDetails);
        }),
        // Fetch RoomType details using the roomTypeId
        switchMap(() => {
          if (!this.bookingDetails) return of(null); // Should not happen due to check above
          return this.searchService.getRoomTypeDetails(this.bookingDetails.roomTypeId);
        }),
        catchError((err) => {
          // Correctly imported catchError
          console.error('Error fetching room type details:', err);
          this.errorMessage = 'Could not load room details. Please try again.';
          // Optionally fetch Hotel details here too if needed for hotelName
          // For now, we keep placeholders
          if (this.bookingDetails) {
            this.bookingDetails.roomTypeName = 'N/A';
            this.bookingDetails.pricePerNight = 0;
            this.bookingDetails.totalPrice = 0;
          }
          this.isLoading = false;
          // Correctly imported throwError
          return throwError(() => new Error(this.errorMessage || 'Failed to load room details'));
        })
      )
      .subscribe((roomType: Room | null) => {
        if (roomType && this.bookingDetails) {
          this.bookingDetails.roomTypeName = roomType.name;
          this.bookingDetails.pricePerNight = roomType.base_price; // Use base_price
          // Recalculate total price based on fetched base_price
          this.bookingDetails.totalPrice = this.calculateTotalPrice(
            this.bookingDetails.checkIn,
            this.bookingDetails.checkOut,
            roomType.base_price
          );
          console.log('Updated booking details with room info:', this.bookingDetails);
        }
        // If roomType is null (error handled in catchError), placeholders/error message remain
        this.isLoading = false; // Finish loading sequence
      });
  }

  // Price calculation using base_price
  calculateTotalPrice(checkIn: string, checkOut: string, pricePerNight: number): number {
    try {
      const startDate = new Date(checkIn);
      const endDate = new Date(checkOut);
      const timeDiff = endDate.getTime() - startDate.getTime();
      // Calculate nights, ensure minimum 1 night if dates are same
      const nights = Math.max(1, Math.ceil(timeDiff / (1000 * 3600 * 24)));
      return nights * pricePerNight;
    } catch (e) {
      console.error('Error calculating price:', e);
      return pricePerNight; // Fallback
    }
  }

  onSubmit(form: NgForm) {
    this.errorMessage = null;
    if (!form.valid || !this.bookingDetails) {
      console.log('Booking form is invalid or missing details');
      Object.keys(form.controls).forEach((field) => {
        form.controls[field].markAsTouched({ onlySelf: true });
      });
      if (!this.bookingDetails) {
        this.errorMessage = 'Booking details are missing. Cannot proceed.';
      }
      return;
    }

    this.isLoading = true;
    console.log('Booking Form Submitted:', form.value);
    console.log('Booking Details:', this.bookingDetails);

    // Prepare data for the booking service
    const bookingPayload = {
      roomTypeId: this.bookingDetails.roomTypeId,
      check_in_date: this.bookingDetails.checkIn,
      check_out_date: this.bookingDetails.checkOut,
      numGuests: this.bookingDetails.guests,
      totalPrice: this.bookingDetails.totalPrice || 0,
      // Add guest details from the form if backend handles nested create
      // guests: [{
      //   first_name: form.value.first_name,
      //   last_name: form.value.last_name,
      //   is_primary: true // Assuming the form captures the primary guest
      //   // Add other guests if form supports it
      // }]
    };

    this.bookingService.createBooking(bookingPayload).subscribe({
      next: (createdBooking) => {
        this.isLoading = false;
        console.log('Booking successful:', createdBooking);
        this.router.navigate(['/booking/confirmation'], {
          queryParams: { bookingRef: createdBooking.booking_reference },
        });
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        this.errorMessage = err.message || 'An unknown error occurred during booking.';
        console.error('Booking failed:', err);
      },
    });
  }
}
