import { Component, OnInit, signal, WritableSignal, computed, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { Hotel } from '../../models/hotel.model'; // Import Hotel only
import { Room } from '../../models/room.model'; // Import Room from correct file
import { HotelService } from '../../services/hotel.service';
import {
  BookingService,
  BookingCreatePayload,
  BookingResponse,
} from '../../services/booking.service';
import { AuthService } from '../../auth/auth.service';
import { NotificationService } from '../../services/notification.service';
import { CalendarModule } from 'primeng/calendar';
import { InputNumberModule } from 'primeng/inputnumber';
import { HoverButtonComponent } from '../../shared/hover-button/hover-button.component'; // Import HoverButtonComponent
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-booking-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CurrencyPipe,
    CalendarModule,
    InputNumberModule,
    HoverButtonComponent,
  ],
  templateUrl: './booking-page.component.html',
  styleUrls: ['./booking-page.component.css'], // Corrected styleUrl to styleUrls
})
export class BookingPageComponent implements OnInit {
  hotel: WritableSignal<Hotel | null> = signal(null);
  hotelId: number | null = null;
  initialRoomTypeId: number | null = null;
  loading = signal(true);
  errorMessage = signal<string | null>(null);
  isSubmitting = signal(false);
  minDate = new Date(); // For calendar

  bookingForm: FormGroup;

  // Inject services using inject function (alternative to constructor injection)
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private hotelService = inject(HotelService);
  private bookingService = inject(BookingService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private fb = inject(FormBuilder);

  constructor() {
    // Initialize the main booking form
    this.bookingForm = this.fb.group({
      dates: [null, Validators.required],
      adults: [1, [Validators.required, Validators.min(1)]],
      children: [0, [Validators.required, Validators.min(0)]],
      special_requests: [''],
      // FormArray for selected rooms (room_type_id, quantity)
      bookedRooms: this.fb.array([], Validators.required),
      // FormArray for guest details (firstName, lastName, is_primary)
      guests: this.fb.array([], Validators.required),
    });
  }

  ngOnInit(): void {
    this.loading.set(true);
    const hotelIdParam = this.route.snapshot.paramMap.get('hotelId');
    const initialRoomTypeIdParam = this.route.snapshot.queryParamMap.get('roomTypeId');

    if (!hotelIdParam) {
      this.handleError('No Hotel ID provided in route.');
      return;
    }

    this.hotelId = +hotelIdParam;
    if (isNaN(this.hotelId)) {
      this.handleError('Invalid Hotel ID provided.');
      return;
    }

    if (initialRoomTypeIdParam) {
      this.initialRoomTypeId = +initialRoomTypeIdParam;
      if (isNaN(this.initialRoomTypeId)) {
        this.initialRoomTypeId = null; // Ignore invalid query param
        console.warn('Invalid initialRoomTypeId query parameter ignored.');
      }
    }

    this.fetchHotelDetails();
    this.setupGuestFormArray(); // Setup initial guest form based on adults/children

    // Subscribe to guest count changes to update guest form array
    this.bookingForm.get('adults')?.valueChanges.subscribe(() => this.setupGuestFormArray());
    this.bookingForm.get('children')?.valueChanges.subscribe(() => this.setupGuestFormArray());
  }

  fetchHotelDetails(): void {
    if (!this.hotelId) return;

    this.hotelService.getHotelById(this.hotelId).subscribe({
      next: (hotelData) => {
        this.hotel.set(hotelData);
        this.loading.set(false);
        // Pre-populate bookedRooms FormArray if initialRoomTypeId exists
        if (this.initialRoomTypeId && hotelData.room_types) {
          const initialRoom = hotelData.room_types.find((rt) => rt.id === this.initialRoomTypeId);
          if (initialRoom) {
            this.addRoomToBooking(initialRoom);
          } else {
            console.warn(`Initial room type ID ${this.initialRoomTypeId} not found in hotel data.`);
          }
        }
      },
      error: (err) => this.handleError(err.message || 'Failed to load hotel details.'),
    });
  }

  // --- FormArray Getters ---
  get bookedRooms(): FormArray {
    return this.bookingForm.get('bookedRooms') as FormArray;
  }

  get guests(): FormArray {
    return this.bookingForm.get('guests') as FormArray;
  }

  // --- Guest Calculation & Form Management ---
  totalGuests = computed(() => {
    const adults = this.bookingForm.get('adults')?.value ?? 0;
    const children = this.bookingForm.get('children')?.value ?? 0;
    return adults + children;
  });

  setupGuestFormArray(): void {
    const total = this.totalGuests();
    const currentGuests = this.guests.length;

    if (total > currentGuests) {
      // Add new guest forms
      for (let i = currentGuests; i < total; i++) {
        this.guests.push(this.createGuestFormGroup(i === 0)); // Mark first as primary
      }
    } else if (total < currentGuests) {
      // Remove excess guest forms
      for (let i = currentGuests - 1; i >= total; i--) {
        this.guests.removeAt(i);
      }
      // Ensure at least one primary guest remains if list not empty
      if (this.guests.length > 0 && !this.guests.controls.some((c) => c.get('is_primary')?.value)) {
        if (this.guests.controls[0]) {
          // Check if control exists before setting value
          this.guests.controls[0].get('is_primary')?.setValue(true);
        }
      }
    }
    // TODO: Pre-fill first guest if user is logged in?
    // const currentUser = this.authService.getCurrentUser();
    // if (currentUser && this.guests.length > 0 && this.guests.controls[0]) {
    //    this.guests.controls[0].patchValue({ first_name: currentUser.first_name, last_name: currentUser.last_name });
    // }
  }

  createGuestFormGroup(isPrimary = false): FormGroup {
    return this.fb.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      is_primary: [isPrimary], // Control if this guest is the primary contact
    });
  }

  // --- Room Selection Logic ---
  addRoomToBooking(room: Room): void {
    // Check if room type already added
    const existingRoomIndex = this.bookedRooms.controls.findIndex(
      (control) => control.value.room_type === room.id
    );

    if (existingRoomIndex !== -1) {
      // Increment quantity if room type exists
      const roomGroup = this.bookedRooms.at(existingRoomIndex);
      const currentQuantity = roomGroup.get('quantity')?.value;
      // TODO: Check against actual availability if implementing dynamic checks
      roomGroup.get('quantity')?.setValue(currentQuantity + 1);
    } else {
      // Add new room type entry
      this.bookedRooms.push(
        this.fb.group({
          room_type: [room.id, Validators.required],
          quantity: [1, [Validators.required, Validators.min(1)]],
          // price_at_booking will be set by backend
        })
      );
    }
    // TODO: Recalculate estimated total price based on bookedRooms array
  }

  removeRoomFromBooking(room: Room): void {
    const existingRoomIndex = this.bookedRooms.controls.findIndex(
      (control) => control.value.room_type === room.id
    );
    let totalRoomsBooked = 0;
    for (let i = 0; i < this.bookedRooms.length; i++) {
      totalRoomsBooked += this.bookedRooms.controls[i].value.quantity;
    }
    if (totalRoomsBooked <= 1) {
      this.notificationService.showError('You must have at least one room selected');
      return;
    }

    const roomName = this.getRoomName(this.bookedRooms.controls[existingRoomIndex].value.room_type);
    const index = this.bookedRooms.controls.findIndex(
      (control) => control.value.room_type === room.id
    );

    this.bookedRooms
      .at(index)
      .get('quantity')
      ?.setValue(
        this.bookedRooms.at(index).get('quantity')?.value >= 1
          ? this.bookedRooms.at(index).get('quantity')?.value - 1
          : 0
      );
    if (this.bookedRooms.at(index).get('quantity')?.value === 0) {
      this.bookedRooms.removeAt(index);
    }
    this.notificationService.showSuccess('Room removed from booking', 1000);
  }

  // --- Submission Logic ---
  onSubmitBooking(): void {
    this.bookingForm.markAllAsTouched();

    if (!this.authService.isAuthenticated()) {
      this.notificationService.showError('Please log in to make a booking.', 1000);
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }

    // Validate that at least one room is selected
    if (this.bookedRooms.length === 0) {
      this.notificationService.showError('Please select at least one room type.', 1000);
      return;
    }

    if (this.bookingForm.invalid) {
      this.notificationService.showError('Please fill in all required fields correctly.', 1000);

      // Log individual control errors
      Object.keys(this.bookingForm.controls).forEach((key) => {
        const controlErrors = this.bookingForm.get(key)?.errors;
        if (controlErrors != null) {
          console.log('Key control: ' + key + ', errors: ' + JSON.stringify(controlErrors));
        }
      });
      this.guests.controls.forEach((group, i) => {
        Object.keys((group as FormGroup).controls).forEach((key) => {
          const controlErrors = (group as FormGroup).get(key)?.errors;
          if (controlErrors != null) {
            console.log(`Guest ${i} Key control: ${key}, errors: ${JSON.stringify(controlErrors)}`);
          }
        });
      });
      this.bookedRooms.controls.forEach((group, i) => {
        Object.keys((group as FormGroup).controls).forEach((key) => {
          const controlErrors = (group as FormGroup).get(key)?.errors;
          if (controlErrors != null) {
            console.log(
              `BookedRoom ${i} Key control: ${key}, errors: ${JSON.stringify(controlErrors)}`
            );
          }
        });
      });
      return;
    }

    const formValue = this.bookingForm.value;
    const check_in_date = formValue.dates[0] as Date;
    const check_out_date = formValue.dates[1] as Date;

    const datePipe = new DatePipe('en-US');
    const formattedCheckIn = datePipe.transform(check_in_date, 'yyyy-MM-dd');
    const formattedCheckOut = datePipe.transform(check_out_date, 'yyyy-MM-dd');

    if (!formattedCheckIn || !formattedCheckOut) {
      this.notificationService.showError('Invalid date format.');
      return;
    }

    // Ensure guest data matches total guest count
    if (formValue.guests.length !== this.totalGuests()) {
      this.notificationService.showError(
        'Guest details count does not match total number of guests.'
      );
      // Force regeneration of guest fields based on current count
      this.setupGuestFormArray();
      return;
    }

    const bookingPayload: BookingCreatePayload = {
      check_in_date: formattedCheckIn,
      check_out_date: formattedCheckOut,
      num_guests: this.totalGuests(),
      special_requests: formValue.special_requests || '',
      booked_rooms: formValue.bookedRooms.map((br: { room_type: number; quantity: number }) => ({
        room_type: br.room_type,
        quantity: br.quantity,
      })),
      guests: formValue.guests.map(
        (g: { first_name: string; last_name: string; is_primary: boolean }) => ({
          first_name: g.first_name,
          last_name: g.last_name,
          is_primary: g.is_primary,
        })
      ),
    };

    this.isSubmitting.set(true);

    this.bookingService
      .createBooking(bookingPayload)
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: (response: BookingResponse) => {
          console.log('Booking successful (PENDING):', response);
          this.notificationService.showSuccess(
            `Booking ${response.booking_reference} initiated! Proceed to payment.`
          );
          // Navigate to PAYMENT page, passing the booking reference
          this.router.navigate(['/booking/payment', response.booking_reference]);
        },
        error: (err: HttpErrorResponse) => {
          console.error('Booking failed:', err);
          const backendError = err.error;
          let displayMessage = 'Booking failed. Please try again.';
          // ... (enhanced error message extraction) ...
          if (typeof backendError === 'object' && backendError !== null) {
            const fieldErrors = Object.entries(backendError)
              .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
              .join('; ');
            if (fieldErrors) {
              // Try to make specific errors more readable
              if (backendError.availability) {
                displayMessage = `Availability Error: ${JSON.stringify(backendError.availability)}`;
              } else {
                displayMessage = `Booking failed: ${fieldErrors}`;
              }
            } else if (backendError.detail) {
              displayMessage = backendError.detail;
            }
          } else if (typeof backendError === 'string') {
            displayMessage = backendError;
          } else if (err.message) {
            displayMessage = err.message;
          }
          this.notificationService.showError(displayMessage);
        },
      });
  }

  private handleError(message: string): void {
    this.errorMessage.set(message);
    this.loading.set(false);
    console.error('Error in BookingPageComponent:', message);
  }

  // Helper methods for booking summary
  getRoomImage(roomTypeId: number): string {
    const currentHotel = this.hotel();
    if (!currentHotel?.room_types) return 'https://via.placeholder.com/200x200?text=Room+Image';

    const roomType = currentHotel.room_types.find((rt) => rt.id === roomTypeId);
    return roomType?.images?.length
      ? roomType.images[0].image_compressed
      : 'https://via.placeholder.com/200x200?text=Room+Image';
  }

  getRoomName(roomTypeId: number): string {
    const currentHotel = this.hotel();
    if (!currentHotel?.room_types) return 'Unknown Room Type';

    const roomType = currentHotel.room_types.find((rt) => rt.id === roomTypeId);
    return roomType?.name || 'Unknown Room Type';
  }

  getRoomPrice(roomTypeId: number): number {
    const currentHotel = this.hotel();
    if (!currentHotel?.room_types) return 0;

    const roomType = currentHotel.room_types.find((rt) => rt.id === roomTypeId);
    return roomType?.base_price || 0;
  }

  calculateSubtotal(): number {
    if (!this.bookedRooms.length) return 0;

    return this.bookedRooms.controls.reduce((total, roomGroup) => {
      const roomTypeId = roomGroup.value.room_type;
      const quantity = roomGroup.value.quantity;
      return total + this.getRoomPrice(roomTypeId) * quantity;
    }, 0);
  }

  calculateTaxes(): number {
    return this.calculateSubtotal() * 0.15; // 15% tax
  }

  calculateTotal(): number {
    return this.calculateSubtotal() + this.calculateTaxes();
  }
}
