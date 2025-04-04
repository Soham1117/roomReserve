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
      // Ensure checkOutDate is treated as a Date object
      const checkOutDate = new Date(booking.checkOutDate);
      checkOutDate.setHours(0, 0, 0, 0); // Compare date part only
      // Include bookings ending today or later
      return checkOutDate >= today;
    });

    this.pastBookings = bookings.filter((booking) => {
      const checkOutDate = new Date(booking.checkOutDate);
      checkOutDate.setHours(0, 0, 0, 0);
      // Include bookings ending before today
      return checkOutDate < today;
    });

    // Optional: Sort bookings within each list
    this.upcomingBookings.sort(
      (a, b) =>
        new Date(a.checkInDate).getTime() - new Date(b.checkInDate).getTime()
    );
    this.pastBookings.sort(
      (a, b) =>
        new Date(b.checkOutDate).getTime() - new Date(a.checkOutDate).getTime()
    );
  }

  // Optional: Add a method to handle booking cancellation if needed in this component
  // cancelBooking(bookingId: number): void { ... }
}
