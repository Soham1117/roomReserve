import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router'; // Import ActivatedRoute
import { Booking } from '../../models/booking.model';
import { BookingService } from '../booking.service'; // Import BookingService
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-confirmation',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './confirmation.component.html',
  styleUrls: ['./confirmation.component.css'], // Corrected property name
})
export class ConfirmationComponent implements OnInit {
  bookingDetails: Booking | undefined;
  isLoading = false;
  errorMessage: string | null = null;
  bookingRef: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private bookingService: BookingService
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.bookingRef = this.route.snapshot.queryParamMap.get('bookingRef');

    if (this.bookingRef) {
      console.log(
        'Fetching confirmation details for bookingRef:',
        this.bookingRef
      );
      // Assuming getBookingDetails can handle bookingReference lookup
      // Note: Backend might need adjustment if it only supports lookup by ID
      this.bookingService.getBookingDetails(this.bookingRef).subscribe({
        next: (booking) => {
          this.bookingDetails = booking;
          this.isLoading = false;
          console.log('Booking details loaded:', this.bookingDetails);
        },
        error: (err: HttpErrorResponse) => {
          this.errorMessage =
            err.message || 'Failed to load booking confirmation details.';
          this.isLoading = false;
          console.error('Error loading booking confirmation:', err);
        },
      });
    } else {
      this.errorMessage = 'Booking reference not found.';
      this.isLoading = false;
      console.error('No bookingRef found in query parameters.');
    }
  }
}
