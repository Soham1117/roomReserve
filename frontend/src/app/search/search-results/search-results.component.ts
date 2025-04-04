import { Component, OnInit, signal, WritableSignal, effect } from '@angular/core'; // Import signal, WritableSignal, effect
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router'; // Import ActivatedRoute, RouterLink
import { HotelCardComponent } from '../hotel-card/hotel-card.component';
import { Hotel } from '../../models/hotel.model';
import { SearchService } from '../search.service';
import { FormsModule } from '@angular/forms';
import { MapComponent } from '../map/map.component'; // Import MapComponent

@Component({
  selector: 'app-search-results',
  standalone: true,
  imports: [CommonModule, HotelCardComponent, FormsModule],
  templateUrl: './search-results.component.html',
  styleUrl: './search-results.component.css',
})
export class SearchResultsComponent implements OnInit {
  hotels: WritableSignal<Hotel[]> = signal([]);
  isLoading: WritableSignal<boolean> = signal(false);
  error: WritableSignal<string | null> = signal(null);

  // Filter and Sort State
  // --- Filter ---
  minRating: number | undefined = undefined; // Example: 0-5
  priceMin: number | undefined = undefined;
  priceMax: number | undefined = undefined;
  // TODO: Get available amenities dynamically
  availableAmenities: string[] = ['WiFi', 'Pool', 'Spa', 'Gym', 'Parking'];
  selectedAmenities: { [key: string]: boolean } = {}; // For checkboxes

  // --- Sort ---
  sortBy: 'price' | 'rating' | 'name' = 'rating'; // Default sort
  sortOrder: 'asc' | 'desc' = 'desc'; // Default order

  // Initial search params from route (optional)
  initialDestination: string | null = null;

  constructor(
    private searchService: SearchService,
    private route: ActivatedRoute
  ) {
    // Optional: React to filter/sort changes using effects if using signals extensively
    // effect(() => {
    //   console.log('Filters changed, reloading hotels...');
    //   this.loadHotels();
    // });
  }

  ngOnInit(): void {
    // Initialize selectedAmenities structure
    this.availableAmenities.forEach((amenity) => {
      this.selectedAmenities[amenity] = false;
    });

    // Get initial search destination from route query params if available
    this.route.queryParams.subscribe((params) => {
      this.initialDestination = params['destination'] || null;
      console.log('Initial destination from route:', this.initialDestination);
      this.loadHotels(); // Load hotels initially
    });
  }

  loadHotels(): void {
    this.isLoading.set(true);
    this.error.set(null);

    const currentAmenities = Object.entries(this.selectedAmenities)
      .filter(([, isSelected]) => isSelected)
      .map(([amenityName]) => amenityName);

    const searchParams = {
      destination: this.initialDestination ?? undefined, // Use initial destination if available
      minRating: this.minRating,
      amenities: currentAmenities.length > 0 ? currentAmenities : undefined,
      priceMin: this.priceMin,
      priceMax: this.priceMax,
      sortBy: this.sortBy,
      sortOrder: this.sortOrder,
    };

    console.log('Loading hotels with params:', searchParams);

    this.searchService.searchHotels(searchParams).subscribe({
      next: (data) => {
        console.log('Hotels loaded from API:', data); // Log raw data
        // Check if any hotels have coordinates
        const hotelsWithCoords = data.filter((h) => h.latitude && h.longitude);
        console.log(
          `Found ${hotelsWithCoords.length} hotels with coordinates out of ${data.length}`
        );
        if (data.length > 0 && hotelsWithCoords.length === 0) {
          console.warn('WARNING: Received hotels, but none have latitude/longitude coordinates.');
        }
        this.hotels.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading hotels:', err);
        this.error.set(err.message || 'Failed to load hotels.');
        this.isLoading.set(false);
        this.hotels.set([]); // Clear hotels on error
      },
    });
  }

  // --- Methods to trigger reload on filter/sort changes ---

  onSortChange(): void {
    console.log(`Sort changed: ${this.sortBy} ${this.sortOrder}`);
    this.loadHotels();
  }

  onFilterChange(): void {
    console.log('Filters changed, reloading...');
    // Debounce this in a real app to avoid excessive API calls
    this.loadHotels();
  }

  onAmenityChange(amenity: string, event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.selectedAmenities[amenity] = isChecked;
    console.log('Amenity changed:', this.selectedAmenities);
    this.onFilterChange(); // Reload hotels when amenities change
  }

  // Helper to get selected amenity names
  getSelectedAmenities(): string[] {
    return Object.entries(this.selectedAmenities)
      .filter(([, checked]) => checked)
      .map(([name]) => name);
  }
}
