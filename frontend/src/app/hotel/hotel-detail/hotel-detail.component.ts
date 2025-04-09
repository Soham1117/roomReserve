import { Component, OnInit, signal, WritableSignal } from '@angular/core'; // Removed ChangeDetectorRef, computed
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, CurrencyPipe } from '@angular/common'; // Removed DatePipe
import { HttpErrorResponse } from '@angular/common/http'; // Import from @angular/common/http
// Removed ReactiveFormsModule
import { Hotel, HotelImage } from '../../models/hotel.model';
import { Room } from '../../models/room.model'; // Keep Room for type hint
import { HotelService } from '../../services/hotel.service';
// Removed BookingService imports
// Removed AuthService import
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators'; // Removed finalize
import { FindPrimaryImagePipe } from '../../shared/pipes/find-primary-image.pipe';
import { HoverButtonComponent } from '../../shared/hover-button/hover-button.component';
// Removed CalendarModule, InputNumberModule
// Removed NotificationService import

// --- Continent Logic (copied from hotel-results) ---
const continentIcons: { [key: string]: string } = {
  'North America': '1.svg',
  'South America': '2.svg',
  Europe: '3.svg',
  Africa: '4.svg',
  Asia: '5.svg',
  Oceania: '6.svg',
  Antarctica: '7.svg',
  Other: '8.svg',
};

function getContinent(lat: number, lng: number): string {
  if (!lat || !lng) return 'Other';
  if (lat > 10 && lng > -170 && lng < -50) return 'North America';
  if (lat < 10 && lat > -60 && lng > -90 && lng < -30) return 'South America';
  if (lat > 35 && lng > -10 && lng < 40) return 'Europe';
  if (lat < 35 && lat > -35 && lng > -20 && lng < 55) return 'Africa';
  if (lat > 0 && lng > 40 && lng < 180) return 'Asia';
  if (lat < 0 && ((lng > 110 && lng < 180) || (lng > -90 && lng < 0))) return 'Oceania';
  if (lat < -60) return 'Antarctica';
  return 'Other';
}
// --- End Continent Logic ---

@Component({
  selector: 'app-hotel-detail',
  standalone: true,
  imports: [
    CommonModule,
    // Removed ReactiveFormsModule
    FindPrimaryImagePipe,
    HoverButtonComponent,
    CurrencyPipe,
    // Removed CalendarModule, InputNumberModule
  ],
  templateUrl: './hotel-detail.component.html',
})
export class HotelDetailComponent implements OnInit {
  hotel: WritableSignal<Hotel | undefined> = signal(undefined);
  hotelId: number | null = null;
  loading: WritableSignal<boolean> = signal(true);
  errorMessage: WritableSignal<string | null> = signal(null);
  suggestedHotels: WritableSignal<Hotel[]> = signal([]);
  loadingSuggestions: WritableSignal<boolean> = signal(false);
  continentIcons = continentIcons;

  // Removed checkout form properties

  constructor(
    private route: ActivatedRoute,
    private hotelService: HotelService,
    public router: Router // Keep Router
    // Removed BookingService, AuthService, NotificationService, FormBuilder, ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.suggestedHotels.set([]);
    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam) {
      this.hotelId = +idParam;
      console.log('Fetching details for hotel ID:', this.hotelId);

      if (isNaN(this.hotelId)) {
        this.handleError('Invalid Hotel ID provided.');
        return;
      }

      this.hotelService
        .getHotelById(this.hotelId)
        .pipe(
          catchError((err) => {
            this.handleError(err.message || 'Failed to load hotel details.');
            return of(undefined);
          })
        )
        .subscribe((hotelDetails: Hotel | undefined) => {
          if (hotelDetails) {
            this.hotel.set(hotelDetails);
            console.log('Hotel Details:', this.hotel());
            if (hotelDetails.city && this.hotelId) {
              this.fetchSuggestedHotels(hotelDetails.city, this.hotelId);
            }
          }
          this.loading.set(false);
        });
    } else {
      this.handleError('No Hotel ID provided in the route.');
      this.loading.set(false);
    }

    // Removed checkoutForm subscription
  }

  private handleError(message: string): void {
    this.errorMessage.set(message);
    this.loading.set(false);
    this.hotel.set(undefined);
    console.error('Error in HotelDetailComponent:', message);
  }

  get secondaryImage(): HotelImage | undefined {
    const currentHotel = this.hotel();
    if (!currentHotel || !currentHotel.images || currentHotel.images.length === 0) {
      return undefined;
    }
    return currentHotel.images.find((img) => !img.is_primary);
  }

  getContinentForHotel(hotel: Hotel): string {
    return getContinent(hotel.latitude ?? 0, hotel.longitude ?? 0);
  }

  getContinentIconPath(hotel: Hotel): string {
    const continent = this.getContinentForHotel(hotel);
    const iconFile = this.continentIcons[continent] || this.continentIcons['Other'];
    return `/${iconFile}`;
  }

  private fetchSuggestedHotels(city: string, currentHotelId: number): void {
    this.loadingSuggestions.set(true);
    this.hotelService.searchHotels(city).subscribe({
      next: (hotels) => {
        this.suggestedHotels.set(hotels.filter((h) => h.id !== currentHotelId).slice(0, 3));
        this.loadingSuggestions.set(false);
        console.log('Suggested Hotels:', this.suggestedHotels());
      },
      error: (err) => {
        console.error('Error fetching suggested hotels:', err);
        this.suggestedHotels.set([]);
        this.loadingSuggestions.set(false);
      },
    });
  }

  // Updated method to navigate instead of setting local state
  selectRoomForBooking(room: Room): void {
    console.log('Navigating to booking page for room:', room.id);
    if (this.hotelId) {
      this.router.navigate(['/booking/create', this.hotelId], {
        queryParams: { roomTypeId: room.id },
      });
    } else {
      console.error('Hotel ID is missing, cannot navigate to booking page.');
      // Optionally show an error to the user
    }
  }

  // Removed recalculatePrice method
  // Removed totalGuests computed signal
  // Removed reserveRoom method
}
