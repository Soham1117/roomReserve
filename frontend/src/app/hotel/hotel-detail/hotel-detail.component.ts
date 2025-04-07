import {
  Component,
  OnInit,
  signal,
  WritableSignal,
  ChangeDetectorRef,
  computed,
} from '@angular/core'; // Added ChangeDetectorRef, computed
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Hotel, HotelImage } from '../../models/hotel.model';
import { Room } from '../../models/room.model';
import { HotelService } from '../../services/hotel.service';
import {
  BookingService,
  BookingCreatePayload,
  BookingResponse,
} from '../../services/booking.service'; // Import BookingResponse
import { AuthService } from '../../auth/auth.service';
import { Observable, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators'; // Import finalize
import { FindPrimaryImagePipe } from '../../shared/pipes/find-primary-image.pipe';
import { HoverButtonComponent } from '../../shared/hover-button/hover-button.component';
import { CalendarModule } from 'primeng/calendar'; // Import CalendarModule
import { InputNumberModule } from 'primeng/inputnumber'; // Import InputNumberModule
import { NotificationService } from '../../services/notification.service'; // Import NotificationService

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
    ReactiveFormsModule, // Add ReactiveFormsModule
    FindPrimaryImagePipe,
    HoverButtonComponent,
    CurrencyPipe,
    CalendarModule, // Add CalendarModule
    InputNumberModule, // Add InputNumberModule
    DatePipe, // Add DatePipe
  ],
  templateUrl: './hotel-detail.component.html',
})
export class HotelDetailComponent implements OnInit {
  // Use signals for reactive state
  hotel: WritableSignal<Hotel | undefined> = signal(undefined);
  // Removed rooms and reviews signals
  hotelId: number | null = null;
  loading: WritableSignal<boolean> = signal(true);
  errorMessage: WritableSignal<string | null> = signal(null);
  // --- State for suggested hotels ---
  suggestedHotels: WritableSignal<Hotel[]> = signal([]);
  loadingSuggestions: WritableSignal<boolean> = signal(false);
  continentIcons = continentIcons;

  // Checkout Form
  checkoutForm: FormGroup;
  selectedRoomType: WritableSignal<Room | null> = signal(null); // Track selected room for booking
  calculatedPrice: WritableSignal<number | null> = signal(null);
  isBookingLoading = signal(false);
  minDate: Date = new Date(); // Add minDate for calendar

  constructor(
    private route: ActivatedRoute,
    private hotelService: HotelService,
    private bookingService: BookingService, // Inject BookingService
    private authService: AuthService, // Inject AuthService
    private notificationService: NotificationService, // Inject NotificationService
    public router: Router,
    private fb: FormBuilder, // Inject FormBuilder
    private cdRef: ChangeDetectorRef
  ) {
    // Initialize Checkout Form
    this.checkoutForm = this.fb.group({
      // Use PrimeNG calendar range requires a single control holding an array [startDate, endDate]
      dates: [null, Validators.required],
      adults: [1, [Validators.required, Validators.min(1)]],
      children: [0, [Validators.required, Validators.min(0)]],
    });
  }

  ngOnInit(): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.suggestedHotels.set([]); // Reset suggestions on init
    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam) {
      this.hotelId = +idParam; // Convert string ID to number
      console.log('Fetching details for hotel ID:', this.hotelId);

      if (isNaN(this.hotelId)) {
        this.handleError('Invalid Hotel ID provided.');
        return;
      }

      // Fetch only hotel details using HotelService
      // Assuming HotelService has a getHotelById method
      this.hotelService
        .getHotelById(this.hotelId) // Use HotelService method
        .pipe(
          catchError((err) => {
            this.handleError(err.message || 'Failed to load hotel details.');
            return of(undefined); // Return observable of undefined on error
          })
        )
        .subscribe((hotelDetails: Hotel | undefined) => {
          // Add type annotation
          // Add type annotation
          if (hotelDetails) {
            this.hotel.set(hotelDetails);
            console.log('Hotel Details:', this.hotel());
            // Fetch suggestions after getting main hotel details
            if (hotelDetails.city && this.hotelId) {
              this.fetchSuggestedHotels(hotelDetails.city, this.hotelId);
            }
          }
          this.loading.set(false);
        });
    } else {
      this.handleError('No Hotel ID provided in the route.');
      this.loading.set(false); // Ensure loading is false if no ID
    }

    // Subscribe to form changes to recalculate price
    this.checkoutForm.valueChanges.subscribe(() => {
      this.recalculatePrice();
    });
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

  // --- Helper to get the first non-primary image ---
  get secondaryImage(): HotelImage | undefined {
    const currentHotel = this.hotel();
    console.log('Current Hotel:', currentHotel);
    if (!currentHotel || !currentHotel.images || currentHotel.images.length === 0) {
      return undefined;
    }
    return currentHotel.images.find((img) => !img.is_primary);
  }

  // --- Helper methods for Continent Tag (for suggested hotels) ---
  getContinentForHotel(hotel: Hotel): string {
    return getContinent(hotel.latitude ?? 0, hotel.longitude ?? 0);
  }

  getContinentIconPath(hotel: Hotel): string {
    const continent = this.getContinentForHotel(hotel);
    const iconFile = this.continentIcons[continent] || this.continentIcons['Other'];
    return `/${iconFile}`; // Prepend slash for public directory path
  }

  // --- Fetch Suggested Hotels ---
  private fetchSuggestedHotels(city: string, currentHotelId: number): void {
    this.loadingSuggestions.set(true);
    this.hotelService.searchHotels(city).subscribe({
      next: (hotels) => {
        // Filter out the current hotel and take the first few (e.g., 3)
        this.suggestedHotels.set(hotels.filter((h) => h.id !== currentHotelId).slice(0, 3));
        this.loadingSuggestions.set(false);
        console.log('Suggested Hotels:', this.suggestedHotels());
      },
      error: (err) => {
        console.error('Error fetching suggested hotels:', err);
        this.suggestedHotels.set([]); // Clear suggestions on error
        this.loadingSuggestions.set(false);
        // Optionally set a specific error message for suggestions
      },
    });
  }

  // --- Checkout Logic ---

  // Method to select a room type (e.g., called from a button in the template)
  selectRoomForBooking(room: Room): void {
    this.selectedRoomType.set(room);
    console.log('Selected room for booking:', room);
    this.recalculatePrice(); // Recalculate price when room changes
  }

  // Recalculate price based on selected room and dates
  recalculatePrice(): void {
    const room = this.selectedRoomType();
    const dates = this.checkoutForm.get('dates')?.value;

    if (room && dates && dates[0] && dates[1]) {
      const checkIn = dates[0] as Date;
      const checkOut = dates[1] as Date;
      // Calculate number of nights (handle potential time zone issues if necessary)
      const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays > 0) {
        // TODO: Fetch price overrides for the date range if backend supports it
        // For now, use base price
        const price = room.base_price * diffDays; // Use base_price
        this.calculatedPrice.set(price);
        console.log(`Calculated price: ${price} for ${diffDays} nights`);
      } else {
        this.calculatedPrice.set(null); // Reset if dates are invalid
      }
    } else {
      this.calculatedPrice.set(null); // Reset if room or dates are missing
    }
  }

  // Computed signal for total guests
  totalGuests = computed(() => {
    const adults = this.checkoutForm.get('adults')?.value ?? 0;
    const children = this.checkoutForm.get('children')?.value ?? 0;
    return adults + children;
  });

  // Handle checkout form submission
  reserveRoom(): void {
    this.checkoutForm.markAllAsTouched(); // Show validation errors if any

    if (!this.authService.isAuthenticated()) {
      this.notificationService.showError('Please log in to make a booking.');
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }

    if (!this.selectedRoomType()) {
      this.notificationService.showError('Please select a room type first.');
      return;
    }

    if (this.checkoutForm.invalid) {
      this.notificationService.showError('Please fill in all required booking details.');
      return;
    }

    if (!this.calculatedPrice()) {
      this.notificationService.showError('Could not calculate price. Please check dates.');
      return;
    }

    const formValue = this.checkoutForm.value;
    const checkInDate = formValue.dates[0] as Date;
    const checkOutDate = formValue.dates[1] as Date;

    // Format dates as YYYY-MM-DD strings for the backend
    const datePipe = new DatePipe('en-US');
    const formattedCheckIn = datePipe.transform(checkInDate, 'yyyy-MM-dd');
    const formattedCheckOut = datePipe.transform(checkOutDate, 'yyyy-MM-dd');

    if (!formattedCheckIn || !formattedCheckOut) {
      this.notificationService.showError('Invalid date format.');
      return;
    }

    const bookingPayload: BookingCreatePayload = {
      room_type: this.selectedRoomType()!.id, // Non-null assertion as we checked above
      check_in_date: formattedCheckIn,
      check_out_date: formattedCheckOut,
      num_guests: this.totalGuests(),
      total_price: this.calculatedPrice()!, // Non-null assertion
      // status defaults to PENDING on backend
      // guests can be added later if needed
    };

    this.isBookingLoading.set(true);
    console.log('Submitting booking:', bookingPayload);

    this.bookingService
      .createBooking(bookingPayload)
      .pipe(finalize(() => this.isBookingLoading.set(false))) // Ensure loading stops
      .subscribe({
        next: (response: BookingResponse) => {
          // Add type to response
          console.log('Booking successful:', response);
          this.notificationService.showSuccess(`Booking ${response.booking_reference} confirmed!`);
          // Navigate to confirmation page with the new booking ID
          this.router.navigate(['/booking/confirmation', response.id]);
          // Reset form and selections after successful navigation (or potentially on confirmation page init)
          // this.checkoutForm.reset({ adults: 1, children: 0 });
          // this.selectedRoomType.set(null);
          // this.calculatedPrice.set(null);
        },
        error: (err) => {
          console.error('Booking failed:', err);
          this.notificationService.showError(err.message || 'Booking failed. Please try again.');
        },
      });
  }
}
