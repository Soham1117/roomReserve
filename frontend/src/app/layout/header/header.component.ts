import {
  Component,
  AfterViewInit, // Add AfterViewInit
  OnDestroy, // Add OnDestroy
  ElementRef,
  Renderer2,
  HostListener,
  OnInit,
  ChangeDetectorRef, // Import ChangeDetectorRef
} from '@angular/core';
import { Router, RouterLink, NavigationEnd } from '@angular/router'; // Import NavigationEnd
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth/auth.service';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { Subscription } from 'rxjs'; // Import Subscription
import { filter } from 'rxjs/operators'; // Import filter

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
export class HeaderComponent implements AfterViewInit, OnDestroy, OnInit {
  isMenuOpen = false;
  private observer: IntersectionObserver | null = null;
  private lastScrollY = 0;
  isHeaderVisible = true;
  isAuthPage = false; // Flag for auth page styling
  private routerSubscription: Subscription | null = null; // To manage router event subscription

  constructor(
    public authService: AuthService,
    private router: Router,
    private el: ElementRef,
    private renderer: Renderer2,
    private cdRef: ChangeDetectorRef // Inject ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.isHeaderVisible = true;
    // Subscribe to router events to detect navigation to auth pages
    this.routerSubscription = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => {
        if (event instanceof NavigationEnd) {
          this.isAuthPage =
            event.url === '/login' || event.url === '/register' || event.url === '/account/profile';
          // Ensure change detection runs if needed, especially with OnPush strategy (though not used here currently)
          this.cdRef.markForCheck();
          // Close menu on navigation
          this.isMenuOpen = false;
        }
      });
    // Initial check in case the component loads directly on an auth page
    this.isAuthPage = this.router.url === '/login' || this.router.url === '/register';
  }

  ngAfterViewInit(): void {
    this.setupIntersectionObserver();
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
    // Unsubscribe from router events to prevent memory leaks
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
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

  // --- Scroll Logic ---
  @HostListener('window:scroll', [])
  onWindowScroll() {
    const currentScrollY = window.scrollY;
    const scrollThreshold = 50;
    const scrollDelta = currentScrollY - this.lastScrollY; // Positive: down, Negative: up

    if (currentScrollY <= scrollThreshold) {
      // Near top? Always show.
      this.isHeaderVisible = true;
    } else {
      // Past threshold, check direction significantly
      if (scrollDelta > 5) {
        // Scrolling down significantly
        this.isHeaderVisible = false;
      } else if (scrollDelta < -5) {
        // Scrolling up significantly
        this.isHeaderVisible = true;
      }
      // If delta is small (-5 to 5), keep current state to avoid flicker
    }

    this.lastScrollY = currentScrollY <= 0 ? 0 : currentScrollY;
  }
}
