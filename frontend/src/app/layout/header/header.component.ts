import {
  Component,
  AfterViewInit, // Add AfterViewInit
  OnDestroy, // Add OnDestroy
  ElementRef, // Add ElementRef
  Renderer2, // Add Renderer2
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth/auth.service';
import { trigger, state, style, transition, animate } from '@angular/animations'; // Import animation functions

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink], // Add RouterLink back
  templateUrl: './header.component.html',
  // Define animations here
  animations: [
    trigger('fadeSlideInOut', [
      state('void', style({ opacity: 0, transform: 'translateY(-20px)' })), // Start state (when element enters)
      transition(':enter', [
        // Transition for entering element
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
      transition(':leave', [
        // Transition for leaving element
        animate('300ms ease-in', style({ opacity: 0, transform: 'translateY(-20px)' })),
      ]),
    ]),
  ],
})
export class HeaderComponent implements AfterViewInit, OnDestroy {
  // Implement interfaces
  isMenuOpen = false; // Property to track menu state
  private observer: IntersectionObserver | null = null;

  // Inject AuthService, Router, ElementRef, Renderer2
  constructor(
    public authService: AuthService,
    private router: Router,
    private el: ElementRef,
    private renderer: Renderer2
  ) {}

  ngAfterViewInit(): void {
    this.setupIntersectionObserver();
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
    // Navigation will happen via routerLink, this just closes the menu
  }

  // Method to check login status (can be called from template)
  isLoggedIn(): boolean {
    return this.authService.isAuthenticated();
  }

  // Method to handle logout
  logout(): void {
    this.authService.logout();
    // Redirect to login page after logout
    this.router.navigate(['/login']);
  }

  // Method to check if the current user is an admin
  isAdmin(): boolean {
    const user = this.authService.getCurrentUser();
    // Check if user exists and roles array includes 'admin'
    return !!user && Array.isArray(user.roles) && user.roles.includes('admin');
  }

  // Optional: Method to get current username for display
  // getUsername(): string | null {
  //   const user = this.authService.getCurrentUser();
  //   return user ? user.username : null;
  // }

  private setupIntersectionObserver(): void {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1, // Trigger early
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Add class when element becomes visible
          this.renderer.addClass(this.el.nativeElement, 'is-visible');
          // Optional: Stop observing after the first time it becomes visible
          if (this.observer) {
            this.observer.unobserve(this.el.nativeElement);
          }
        }
        // No need for an 'else' if we only want it to animate in once
      });
    }, options);

    // Start observing the host element
    this.observer.observe(this.el.nativeElement);
  }
}
