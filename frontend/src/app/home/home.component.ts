import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  HostListener,
  Renderer2,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SearchService } from '../search/search.service';
import { Hotel } from '../models/hotel.model';
import { HttpErrorResponse } from '@angular/common/http'; // Keep HttpErrorResponse
import { HotelService } from '../services/hotel.service'; // Import HotelService
import { ContinentListComponent } from '../continent-list/continent-list.component';
import { Router } from '@angular/router';
import { HoverButtonComponent } from '../shared/hover-button/hover-button.component';
import { CalendarModule } from 'primeng/calendar';
// import { format } from 'date-fns'; // No longer needed here
import { FindPrimaryImagePipe } from '../shared/pipes/find-primary-image.pipe';
import { SearchBarComponent, SearchCriteria } from '../shared/search-bar/search-bar.component'; // Import shared component and interface

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    ContinentListComponent,
    // FormsModule, // No longer needed directly if search bar handles its own model
    HoverButtonComponent,
    // CalendarModule, // No longer needed directly
    FindPrimaryImagePipe,
    SearchBarComponent, // Import the SearchBarComponent
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  featuredHotels: Hotel[] = [];
  isLoading = false;
  errorMessage: string | null = null;
  mouseX = 0;
  mouseY = 0;
  movementFactor = 0.05;

  @ViewChild('img4') img4!: ElementRef<HTMLImageElement>;
  @ViewChild('img1') img1!: ElementRef<HTMLImageElement>;
  @ViewChild('img2') img2!: ElementRef<HTMLImageElement>;
  @ViewChild('img3') img3!: ElementRef<HTMLImageElement>;
  @ViewChild('img5') img5!: ElementRef<HTMLImageElement>;
  @ViewChild('img6') img6!: ElementRef<HTMLImageElement>;
  @ViewChild('heroSection') heroSection!: ElementRef<HTMLElement>;
  // Removed @ViewChild('dateRangeCalendar')

  private observer: IntersectionObserver | null = null;
  // Removed search bar state properties: isSearchFocused, destination, rangeDates, adults, children, showGuestSelector

  // Keep mouse move listener if parallax is still desired
  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    this.mouseX = event.clientX;
    this.mouseY = event.clientY;
    this.updateParallax();
  }

  constructor(
    // private searchService: SearchService, // Remove if not used elsewhere
    private hotelService: HotelService,
    private renderer: Renderer2,
    private el: ElementRef, // Keep for parallax/intersection observer
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadFeaturedHotels(); // Call the updated method
  }

  ngAfterViewInit() {
    console.log('Home component view initialized for mouse parallax.');
    this.setupIntersectionObserver();
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  // --- Parallax Logic ---
  updateParallax() {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const offsetX = (this.mouseX - centerX) * this.movementFactor;
    const offsetY = (this.mouseY - centerY) * this.movementFactor;
    this.applyMouseParallax(this.img1?.nativeElement, -offsetX * 0.8, -offsetY * 0.8);
    this.applyMouseParallax(this.img2?.nativeElement, -offsetX * 1.2, -offsetY * 1.2);
    this.applyMouseParallax(this.img3?.nativeElement, -offsetX * 0.5, -offsetY * 0.5);
    this.applyMouseParallax(this.img4?.nativeElement, -offsetX * 1.0, -offsetY * 1.0);
    this.applyMouseParallax(this.img5?.nativeElement, -offsetX * 1.5, -offsetY * 1.5);
    this.applyMouseParallax(this.img6?.nativeElement, -offsetX * 0.3, -offsetY * 0.3);
  }

  private applyMouseParallax(element: HTMLElement | undefined, offsetX: number, offsetY: number) {
    if (element) {
      this.renderer.setStyle(element, 'transform', `translate(${offsetX}px, ${offsetY}px)`);
    }
  }

  // --- Search Bar Logic (Removed - Moved to SearchBarComponent) ---

  // --- Intersection Observer Logic ---
  private setupIntersectionObserver(): void {
    const options = { root: null, rootMargin: '0px', threshold: 0.1 };
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const heroElement = this.heroSection?.nativeElement;
        if (!heroElement) return;
        if (entry.isIntersecting) {
          this.renderer.addClass(heroElement, 'is-visible');
          if (this.observer) {
            this.observer.unobserve(this.el.nativeElement);
          }
        }
      });
    }, options);
    this.observer.observe(this.el.nativeElement);
  }

  // --- Search Action (Handles event from SearchBarComponent) ---
  handleSearch(criteria: SearchCriteria): void {
    console.log('HomeComponent: Received search criteria:', criteria);

    // Navigate to the hotel-results page with query parameters
    this.router.navigate(['/hotel-results'], {
      queryParams: {
        destination: criteria.destination,
        checkIn: criteria.checkIn,
        checkOut: criteria.checkOut,
        adults: criteria.adults,
        children: criteria.children,
      },
    });
  }

  // --- Image Loading ---
  // Remove old image logic: availableImages, heroImageUrl, usedImageIndices, getRandomImageUrl, getHotelImageUrl
  // Keep loadFeaturedHotels if it fetches actual data, otherwise remove or update it
  loadFeaturedHotels(): void {
    this.isLoading = true;
    this.errorMessage = null;
    // Fetch hotels (e.g., all or based on some criteria)
    // Using empty search for now to get some hotels
    this.hotelService.searchHotels('').subscribe({
      next: (hotels: Hotel[]) => {
        // Add type annotation
        // Take the first 6 hotels for the parallax images
        this.featuredHotels = hotels.slice(0, 6);
        this.isLoading = false;
        console.log('Fetched Featured Hotels for Home:', this.featuredHotels);
        // Note: Parallax update might need explicit trigger if positions depend on image load/size
      },
      error: (err: HttpErrorResponse) => {
        // Add type annotation
        this.errorMessage = 'Failed to load featured hotels.';
        this.isLoading = false;
        console.error('Error loading featured hotels:', err);
        this.featuredHotels = []; // Ensure array is empty on error
      },
    });
  }
  createMockHotels(): Hotel[] {
    // This can likely be removed if loadFeaturedHotels fetches real data
    return [];
  }

  openExploreMap() {
    this.router.navigate(['/explore-map']);
  }
}
