import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
// Removed RoomListComponent, ReviewComponent imports
import { Hotel } from '../../models/hotel.model';
// Removed Room, Review model imports
import { SearchService } from '../../search/search.service';
import { Observable, of } from 'rxjs'; // Keep Observable, of
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-hotel-detail',
  standalone: true,
  imports: [CommonModule], // Removed RoomListComponent, ReviewComponent
  templateUrl: './hotel-detail.component.html',
  // Removed styleUrls
})
export class HotelDetailComponent implements OnInit {
  // Use signals for reactive state
  hotel: WritableSignal<Hotel | undefined> = signal(undefined);
  // Removed rooms and reviews signals
  hotelId: number | null = null;
  loading: WritableSignal<boolean> = signal(true);
  errorMessage: WritableSignal<string | null> = signal(null);

  constructor(
    private route: ActivatedRoute,
    private searchService: SearchService, // Inject SearchService
    private router: Router // Inject Router for navigation
  ) {}

  ngOnInit(): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam) {
      this.hotelId = +idParam; // Convert string ID to number
      console.log('Fetching details for hotel ID:', this.hotelId);

      if (isNaN(this.hotelId)) {
        this.handleError('Invalid Hotel ID provided.');
        return;
      }

      // Fetch only hotel details
      this.searchService
        .getHotelDetails(this.hotelId)
        .pipe(
          catchError((err) => {
            this.handleError(err.message || 'Failed to load hotel details.');
            return of(undefined); // Return observable of undefined on error
          })
        )
        .subscribe((hotelDetails) => {
          if (hotelDetails) {
            this.hotel.set(hotelDetails);
            console.log('Hotel Details:', this.hotel());
          }
          // If hotelDetails is undefined (due to error), signal remains undefined
          this.loading.set(false);
        });
    } else {
      this.handleError('No Hotel ID provided in the route.');
    }
  }

  // Helper function to handle errors
  private handleError(message: string): void {
    this.errorMessage.set(message);
    this.loading.set(false);
    this.hotel.set(undefined);
    // Removed rooms.set([]) and reviews.set([])
    console.error('Error in HotelDetailComponent:', message);
  }

  // Removed formattedRating getter
  // Removed onRoomSelected method
}
