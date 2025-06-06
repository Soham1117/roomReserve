import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Booking } from '../../models/booking.model';
import { UserService } from '../user.service'; // Import UserService
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-bookings-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bookings-list.component.html',
  styleUrls: ['./bookings-list.component.css'], // Corrected property name
})
export class BookingsListComponent implements OnInit {
  upcomingBookings: Booking[] = [];
  pastBookings: Booking[] = [];
  isLoading = false;
  errorMessage: string | null = null;

  constructor(private userService: UserService) {} // Inject UserService

  ngOnInit(): void {
    this.loadUserBookings();
  }

  loadUserBookings(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.userService.getUserBookings().subscribe({
      next: (bookings) => {
        this.processBookings(bookings);
        this.isLoading = false;
        console.log('User bookings loaded:', bookings);
      },
      error: (err: HttpErrorResponse) => {
        this.errorMessage = err.message || 'Failed to load bookings.';
        this.isLoading = false;
        console.error('Error loading bookings:', err);
      },
    });
  }

  processBookings(bookings: Booking[]): void {
    const today = new Date();
    // Set time to 00:00:00 to compare dates only
    today.setHours(0, 0, 0, 0);

    this.upcomingBookings = bookings.filter((booking) => {
      // Ensure check_out_date is treated as a Date object
      const check_out_date = new Date(booking.check_out_date);
      check_out_date.setHours(0, 0, 0, 0); // Compare date part only
      // Include bookings ending today or later
      return check_out_date >= today;
    });

    this.pastBookings = bookings.filter((booking) => {
      const check_out_date = new Date(booking.check_out_date);
      check_out_date.setHours(0, 0, 0, 0);
      // Include bookings ending before today
      return check_out_date < today;
    });

    // Optional: Sort bookings within each list
    this.upcomingBookings.sort(
      (a, b) => new Date(a.check_in_date).getTime() - new Date(b.check_in_date).getTime()
    );
    this.pastBookings.sort(
      (a, b) => new Date(b.check_out_date).getTime() - new Date(a.check_out_date).getTime()
    );
  }

  // Optional: Add a method to handle booking cancellation if needed in this component
  // cancelBooking(bookingId: number): void { ... }
}
