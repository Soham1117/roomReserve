import { Component } from '@angular/core';
import { Router } from '@angular/router'; // Import Router

@Component({
  selector: 'app-payment',
  standalone: true, // Add standalone: true
  imports: [],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.css',
})
export class PaymentComponent {
  constructor(private router: Router) {} // Inject Router

  simulatePayment() {
    console.log('Simulating successful payment...');
    // TODO: Call actual booking service to finalize booking
    // Navigate to confirmation page on success
    this.router.navigate(['/booking/confirmation']); // Navigate to confirmation page
  }
}
