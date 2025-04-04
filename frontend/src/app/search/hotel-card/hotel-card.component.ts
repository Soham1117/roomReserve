import { Component, Input, OnChanges, SimpleChanges } from '@angular/core'; // Import Input, OnChanges, SimpleChanges
import { CommonModule } from '@angular/common';
import { Hotel } from '../../models/hotel.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-hotel-card',
  standalone: true, // Add standalone: true
  imports: [CommonModule], // Add CommonModule
  templateUrl: './hotel-card.component.html',
  styleUrl: './hotel-card.component.css',
})
export class HotelCardComponent implements OnChanges {
  // Implement OnChanges
  @Input() hotel!: Hotel;

  constructor(private router: Router) {}

  ngOnChanges(changes: SimpleChanges): void {
    // Log the rating value and type when the hotel input changes
    if (changes['hotel'] && this.hotel) {
      // Use snake_case to match incoming API data
      console.log(
        `HotelCardComponent (ID: ${this.hotel.id}): Received star_rating = ${
          (this.hotel as any).star_rating // Use type assertion for logging if needed
        }, Type = ${typeof (this.hotel as any).star_rating}`
      );
    }
  }

  // Getter for formatted star rating
  get formattedRating(): string {
    // Access star_rating using bracket notation to handle potential type mismatch
    const rating = (this.hotel as any)['star_rating'];
    if (rating != null && typeof rating === 'number') {
      return rating.toFixed(1);
    } else if (rating != null && typeof rating === 'string') {
      // Attempt to parse if it's a string
      const parsedRating = parseFloat(rating);
      return !isNaN(parsedRating) ? parsedRating.toFixed(1) : 'N/A';
    }
    return 'N/A';
  }

  // Method to handle image error
  handleImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    target.src =
      'https://via.placeholder.com/400x300.png?text=Image+Not+Available';
  }

  // Method to handle image loading error
  onImageError(event: Event) {
    const target = event.target as HTMLImageElement;
    target.src = 'https://via.placeholder.com/400x300.png?text=Hotel+Image';
  }

  viewDetails() {
    // Use snake_case here too if accessing rating
    console.log('View details for hotel:', (this.hotel as any).star_rating);
    if (this.hotel?.id) {
      this.router.navigate(['/hotel', this.hotel.id]);
    }
  }

  bookNow() {
    // For now, navigate to the detail page. Can be updated later for direct booking flow.
    console.log('Book Now clicked for hotel:', this.hotel.id);
    if (this.hotel?.id) {
      // Typically, this would navigate to a booking page or initiate a booking process.
      // For simplicity matching viewDetails for now:
      this.router.navigate(['/hotel', this.hotel.id]);
    }
  }
}
