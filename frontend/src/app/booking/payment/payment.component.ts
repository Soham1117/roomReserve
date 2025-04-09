import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { BookingService } from '../../services/booking.service';
import type { BookingResponse } from '../../services/booking.service';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.css',
})
export class PaymentComponent implements OnInit {
  booking: BookingResponse | null = null;
  paymentForm: FormGroup;
  loading = false;
  error = '';
  bookingId!: string;
  savedPaymentMethods: any[] = []; // Will store user's saved payment methods

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private bookingService: BookingService,
    private fb: FormBuilder
  ) {
    this.paymentForm = this.fb.group({
      cardNumber: ['', [Validators.required, Validators.pattern(/^\d{16}$/)]],
      cardHolder: ['', Validators.required],
      expiryMonth: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])$/)]],
      expiryYear: ['', [Validators.required, Validators.pattern(/^\d{2}|\d{4}$/)]],
      cvv: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]],
    });
  }

  ngOnInit(): void {
    this.bookingId = this.route.snapshot.params['id'];
    this.loadBookingDetails();
    this.loadSavedPaymentMethods();
  }

  loadSavedPaymentMethods(): void {
    // TODO: Replace with actual API call to get user's payment methods
    this.savedPaymentMethods = [
      {
        id: '1',
        cardType: 'Visa',
        last4: '4242',
        fullNumber: '4242424242424242',
        expiryMonth: '12',
        expiryYear: '2025',
        cardHolder: 'Test User',
      },
    ];
  }

  fillPaymentDetails(event: Event): void {
    const methodId = (event.target as HTMLSelectElement).value;
    if (!methodId) return;

    const method = this.savedPaymentMethods.find((m) => m.id === methodId);
    if (method) {
      this.paymentForm.patchValue({
        cardNumber: method.fullNumber,
        cardHolder: method.cardHolder,
        expiryMonth: method.expiryMonth,
        expiryYear: method.expiryYear,
      });
    }
  }

  loadBookingDetails(): void {
    this.loading = true;
    this.bookingService.getBookingByReference(this.bookingId).subscribe({
      next: (bookings: BookingResponse[]) => {
        if (bookings.length > 0) {
          this.booking = bookings[0];
        } else {
          this.booking = null;
          this.error = 'Booking not found';
        }
        this.loading = false;
      },
      error: (err: Error) => {
        this.error = 'Failed to load booking details';
        this.loading = false;
      },
    });
  }

  submitPayment(): void {
    console.log('Payment submission initiated');

    // Mark all fields as touched to show errors
    this.paymentForm.markAllAsTouched();

    if (!this.booking) {
      console.error('No booking data loaded');
      this.error = 'Failed to load booking details';
      return;
    }

    if (this.paymentForm.invalid) {
      console.warn('Form invalid - errors:', this.paymentForm.errors);
      Object.keys(this.paymentForm.controls).forEach((key) => {
        const control = this.paymentForm.get(key);
        if (control?.invalid) {
          console.warn(`Field ${key} is invalid:`, control.errors);
        }
      });
      return;
    }

    this.loading = true;
    console.log('Calling confirmPayment for booking ID:', this.booking?.id);

    this.bookingService.confirmPaymentAction(this.booking.id).subscribe({
      next: (response) => {
        console.log('Payment confirmed successfully', response);
        this.router.navigate(['/booking/confirmation', this.bookingId]);
      },
      error: (err: Error) => {
        console.error('Payment confirmation failed:', err);
        this.error = err.message || 'Payment failed';
        this.loading = false;
      },
    });
  }
}
