import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { HoverButtonComponent } from '../../shared/hover-button/hover-button.component'; // Import HoverButtonComponent

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, HoverButtonComponent], // Add HoverButtonComponent
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  errorMessage: string | null = null; // Add property for error messages
  isLoading = false; // Add loading state

  // Inject AuthService and Router
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(form: NgForm) {
    this.errorMessage = null; // Clear previous errors
    if (!form.valid) {
      console.log('Form is invalid');
      // Mark fields as touched to show errors
      Object.keys(form.controls).forEach((field) => {
        form.controls[field].markAsTouched({ onlySelf: true });
      });
      return;
    }

    // Add password match validation
    if (form.value.password !== form.value.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      console.error('Passwords do not match');
      // Mark confirm password field as touched/invalid (optional)
      form.controls['confirmPassword']?.setErrors({ mismatch: true });
      form.controls['confirmPassword']?.markAsTouched();
      return; // Stop submission
    }

    this.isLoading = true;
    console.log('Register Form Submitted:', form.value);

    // Construct payload with correct snake_case keys for backend UserSerializer
    const payload = {
      username: form.value.username,
      email: form.value.email,
      password: form.value.password,
      first_name: form.value.first_name, // Map from camelCase
      last_name: form.value.last_name, // Map from camelCase
    };

    this.authService.register(payload).subscribe({
      // Send the constructed payload
      next: (response) => {
        this.isLoading = false;
        console.log('Registration response:', response);
        // Navigate to login page on successful registration
        // Optionally show a success message first
        alert('Registration successful! Please log in.'); // Simple alert for now
        this.router.navigate(['/login']);
      },
      error: (error: HttpErrorResponse) => {
        this.isLoading = false;
        this.errorMessage = error.message || 'Registration failed. Please try again.';
        console.error('Registration error:', error);
        // Display error message to user (e.g., bind this.errorMessage in the template)
      },
    });
  }
}
