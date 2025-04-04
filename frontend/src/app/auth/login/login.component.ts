import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router'; // Import Router
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  standalone: true, // Add standalone: true
  imports: [CommonModule, FormsModule, RouterLink], // Add CommonModule, FormsModule and RouterLink
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  // Inject AuthService and Router
  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(form: NgForm) {
    if (form.valid) {
      console.log('Login Form Submitted:', form.value);
      this.authService.login(form.value).subscribe({
        next: (response) => {
          console.log('Login response:', response);
          // Navigate to homepage on successful login
          this.router.navigate(['/']);
        },
        error: (error) => {
          console.error('Login error:', error);
          // Error message display should be handled in the template based on an error property
        },
      });
    } else {
      console.log('Form is invalid');
      // Optionally mark fields as touched to show errors
      Object.keys(form.controls).forEach((field) => {
        const control = form.controls[field];
        control.markAsTouched({ onlySelf: true });
      });
    }
  }
}
