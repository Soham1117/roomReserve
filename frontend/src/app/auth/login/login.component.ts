import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth.service';
import { HoverButtonComponent } from '../../shared/hover-button/hover-button.component'; // Import HoverButtonComponent

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, HoverButtonComponent], // Add HoverButtonComponent
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  isLoading = false; // Add loading state
  errorMessage: string | null = null; // Add error message state

  // Inject AuthService and Router
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(form: NgForm) {
    this.errorMessage = null; // Clear previous errors
    if (!form.valid) {
      console.log('Form is invalid');
      // Mark all fields as touched to show validation errors in the template
      Object.values(form.controls).forEach((control) => {
        control.markAsTouched();
      });
      return;
    }

    this.isLoading = true;
    console.log('Login Form Submitted:', form.value);
    this.authService.login(form.value).subscribe({
      next: (response) => {
        this.isLoading = false;
        console.log('Login successful, navigating home.');
        this.router.navigate(['/']); // Navigate to homepage
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.message || 'Login failed. Please try again.';
        console.error('Login error:', error);
      },
    });
  }
}
