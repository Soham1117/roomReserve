import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-search-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-form.component.html',
  styleUrls: ['./search-form.component.css'],
})
export class SearchFormComponent {
  // Add properties to bind to the form fields using ngModel
  destination: string = '';
  checkInDate: string = '';
  checkOutDate: string = '';
  guests: number = 1;

  constructor(private router: Router) {} // Inject Router

  onSearch(form: NgForm) {
    if (form.valid) {
      console.log('Search Form Submitted:', form.value);

      // Basic date validation (optional but recommended)
      if (
        this.checkInDate &&
        this.checkOutDate &&
        this.checkOutDate <= this.checkInDate
      ) {
        // Handle date error - maybe show a message to the user
        console.error('Check-out date must be after check-in date.');
        // You might want to set an error message property to display in the template
        return;
      }

      // Prepare query parameters, removing any empty values
      const queryParams: any = {};
      if (form.value.destination) {
        queryParams.destination = form.value.destination;
      }
      if (form.value.checkInDate) {
        queryParams.checkIn = form.value.checkInDate;
      }
      if (form.value.checkOutDate) {
        queryParams.checkOut = form.value.checkOutDate;
      }
      if (form.value.guests) {
        queryParams.guests = form.value.guests;
      }

      // Navigate to the search results page with query parameters
      this.router.navigate(['/search/results'], { queryParams: queryParams });
    } else {
      console.log('Search form is invalid');
      // Optionally mark fields as touched to show errors
      Object.keys(form.controls).forEach((field) => {
        const control = form.controls[field];
        control.markAsTouched({ onlySelf: true });
      });
    }
  }
}
