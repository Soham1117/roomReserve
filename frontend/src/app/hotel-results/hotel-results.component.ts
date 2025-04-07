import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HotelService } from '../services/hotel.service';
import { Hotel } from '../models/hotel.model';
import { HoverButtonComponent } from '../shared/hover-button/hover-button.component';
import { FindPrimaryImagePipe } from '../shared/pipes/find-primary-image.pipe';
import { SearchBarComponent, SearchCriteria } from '../shared/search-bar/search-bar.component'; // Import SearchBarComponent and SearchCriteria
import { Router } from '@angular/router'; // Import Router

// --- Continent Logic (copied from explore-map) ---
const continentIcons: { [key: string]: string } = {
  'North America': '1.svg',
  'South America': '2.svg',
  Europe: '3.svg',
  Africa: '4.svg', // Note: explore-map had 7.svg for Africa, using 4.svg based on filename convention
  Asia: '5.svg',
  Oceania: '6.svg',
  Antarctica: '7.svg', // Assuming 7 is Antarctica
  Other: '8.svg',
};

function getContinent(lat: number, lng: number): string {
  if (!lat || !lng) return 'Other'; // Handle null/undefined coords
  if (lat > 10 && lng > -170 && lng < -50) return 'North America';
  if (lat < 10 && lat > -60 && lng > -90 && lng < -30) return 'South America';
  if (lat > 35 && lng > -10 && lng < 40) return 'Europe';
  if (lat < 35 && lat > -35 && lng > -20 && lng < 55) return 'Africa';
  if (lat > 0 && lng > 40 && lng < 180) return 'Asia';
  // Combined Oceania checks
  if (lat < 0 && ((lng > 110 && lng < 180) || (lng > -90 && lng < 0))) return 'Oceania';
  if (lat < -60) return 'Antarctica';
  return 'Other';
}
// --- End Continent Logic ---

@Component({
  selector: 'app-hotel-results',
  standalone: true,
  imports: [
    CommonModule,
    HoverButtonComponent,
    FindPrimaryImagePipe,
    SearchBarComponent, // Add SearchBarComponent here
  ],
  templateUrl: './hotel-results.component.html',
  styleUrl: './hotel-results.component.css',
})
export class HotelResultsComponent implements OnInit {
  // Add continentIcons map as a property
  continentIcons = continentIcons;

  destination: string | null = null;
  checkIn: string | null = null;
  checkOut: string | null = null;
  adults: number | null = null;
  children: number | null = null;

  hotels: Hotel[] = []; // To store search results
  isLoading: boolean = false; // Loading indicator
  errorMessage: string | null = null; // Error message

  constructor(
    private route: ActivatedRoute,
    private hotelService: HotelService,
    private router: Router // Inject Router
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.destination = params['destination'];
      this.checkIn = params['checkIn'];
      this.checkOut = params['checkOut'];
      this.adults = params['adults'] ? +params['adults'] : null; // Convert to number
      this.children = params['children'] ? +params['children'] : null; // Convert to number

      console.log('Search Parameters:', {
        destination: this.destination,
        checkIn: this.checkIn,
        checkOut: this.checkOut,
        adults: this.adults,
        children: this.children,
      });

      // Fetch hotel data if destination exists
      if (this.destination) {
        this.fetchHotels(this.destination);
      } else {
        this.errorMessage = 'No destination provided for search.';
      }
    });
  }

  fetchHotels(destination: string): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.hotels = [];

    this.hotelService.searchHotels(destination).subscribe({
      next: (data) => {
        this.hotels = data; // Assign fetched data directly
        this.isLoading = false;
        if (this.hotels.length === 0) {
          this.errorMessage = 'No hotels found matching your criteria.';
        }
        console.log('Fetched Hotels:', this.hotels); // Log fetched hotels
      },
      error: (err) => {
        console.error('HotelResultsComponent: Error callback triggered.'); // Add explicit log
        console.error('HotelResultsComponent: Received error object:', err); // Log the full error
        this.errorMessage = 'Failed to fetch hotels. Please try again later.';
        this.isLoading = false;
        // console.error('Error fetching hotels:', err); // Keep original log too
      },
    });
  }

  // Placeholder method for booking action
  bookHotel(hotelId: number): void {
    console.log(`TODO: Implement booking for hotel ID: ${hotelId}`);
    // Navigate to booking page or open modal later
  }

  // Placeholder method for viewing details
  viewHotelDetails(hotelId: number): void {
    console.log(`Navigating to details for hotel ID: ${hotelId}`);
    this.router.navigate(['/hotels/hotels/', hotelId]); // Use router to navigate
  }

  // --- Helper methods for Continent Tag ---
  getContinentForHotel(hotel: Hotel): string {
    return getContinent(hotel.latitude ?? 0, hotel.longitude ?? 0);
  }

  getContinentIconPath(hotel: Hotel): string {
    const continent = this.getContinentForHotel(hotel);
    const iconFile = this.continentIcons[continent] || this.continentIcons['Other'];
    return `/${iconFile}`; // Prepend slash for public directory path
  }
  // --- End Helper methods ---

  // --- Handle Search Event from Shared Component ---
  handleSearch(criteria: SearchCriteria): void {
    console.log('HotelResultsComponent: Received search criteria:', criteria);

    // Update component properties
    this.destination = criteria.destination;
    this.checkIn = criteria.checkIn;
    this.checkOut = criteria.checkOut;
    this.adults = criteria.adults;
    this.children = criteria.children;

    // Update URL query parameters without full navigation
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: criteria,
      queryParamsHandling: 'merge', // Merge with existing params if needed, or use '' to replace
      replaceUrl: true, // Replace state in history
    });

    // Re-fetch hotels with the new destination
    if (this.destination) {
      this.fetchHotels(this.destination);
    } else {
      // Handle case where destination might be cleared
      this.hotels = [];
      this.errorMessage = 'Please enter a destination.';
    }
  }
}
