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
import { HttpErrorResponse } from '@angular/common/http';
import { ContinentListComponent } from '../continent-list/continent-list.component';
import { Router } from '@angular/router';
import { HoverButtonComponent } from '../shared/hover-button/hover-button.component';
import { CalendarModule } from 'primeng/calendar'; // Keep PrimeNG CalendarModule
import { format } from 'date-fns'; // Keep format for searchHotels

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    ContinentListComponent,
    FormsModule,
    HoverButtonComponent,
    CalendarModule, // Keep CalendarModule
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
  @ViewChild('dateRangeCalendar') dateRangeCalendar: any; // Add ViewChild for p-calendar instance

  private observer: IntersectionObserver | null = null;
  isSearchFocused = false;
  // Search parameters
  destination: string = '';
  // Removed checkInDate, checkOutDate, selectedStartDate, selectedEndDate
  rangeDates: Date[] | null = null; // Use this for PrimeNG [(ngModel)]
  adults: number = 2;
  children: number = 0;
  showGuestSelector: boolean = false;
  // Removed showDatePicker

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    this.mouseX = event.clientX;
    this.mouseY = event.clientY;
    this.updateParallax();
  }

  constructor(
    private searchService: SearchService,
    private renderer: Renderer2,
    private el: ElementRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadFeaturedHotels();
    this.heroImageUrl = this.getRandomImageUrl();
    const heroIndex = this.availableImages.indexOf(this.heroImageUrl.replace('/', ''));
    if (heroIndex !== -1) {
      this.usedImageIndices.add(heroIndex);
    }
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

  // --- Search Bar Logic ---
  toggleSearchFocus(state: boolean): void {
    this.isSearchFocused = state;
    const searchBarElement = this.el.nativeElement.querySelector('.search-bar');
    if (searchBarElement) {
      if (state) {
        this.renderer.addClass(searchBarElement, 'is-focused');
      } else {
        this.renderer.removeClass(searchBarElement, 'is-focused');
      }
    }
  }

  handleBlur(event: FocusEvent): void {
    // Rely on document click listener to close
  }

  // --- Calendar Open Logic ---
  onCalendarOpen(): void {
    // Close guest selector if calendar is opened
    if (this.showGuestSelector) {
      this.showGuestSelector = false;
    }
  }

  // --- Guest Selector Logic ---
  toggleGuestSelector(event: MouseEvent): void {
    event.stopPropagation();
    const opening = !this.showGuestSelector;
    this.showGuestSelector = opening;

    // If opening guest selector, close calendar if it's open
    if (opening && this.dateRangeCalendar && this.dateRangeCalendar.overlayVisible) {
      this.dateRangeCalendar.hideOverlay();
    }
  }

  changeGuests(type: 'adults' | 'children', delta: number): void {
    if (type === 'adults') {
      this.adults = Math.max(1, this.adults + delta);
    }
    if (type === 'children') {
      this.children = Math.max(0, this.children + delta);
    }
  }

  get totalGuests(): number {
    return this.adults + this.children;
  }

  // Close popups if clicking outside the main search container
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const searchContainerElement = this.el.nativeElement.querySelector('.search-bar-container');
    if (searchContainerElement && !searchContainerElement.contains(event.target as Node)) {
      if (this.isSearchFocused) {
        this.toggleSearchFocus(false);
      }
      if (this.showGuestSelector) {
        this.showGuestSelector = false;
      }
      // Removed check for showDatePicker
    }
    // Close PrimeNG calendar if clicking outside? - PrimeNG might handle this internally
  }

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

  // --- Search Action ---
  searchHotels(): void {
    // Format dates from PrimeNG model (rangeDates array)
    const checkInParam = this.rangeDates?.[0] ? format(this.rangeDates[0], 'yyyy-MM-dd') : null;
    // Important: PrimeNG range selection might put null in the second position if only one date is selected
    const checkOutParam = this.rangeDates?.[1] ? format(this.rangeDates[1], 'yyyy-MM-dd') : null;

    console.log('Searching with:', {
      destination: this.destination,
      checkIn: checkInParam,
      checkOut: checkOutParam,
      adults: this.adults,
      children: this.children,
    });

    this.router.navigate(['/search'], {
      queryParams: {
        destination: this.destination || null,
        checkIn: checkInParam,
        checkOut: checkOutParam,
        adults: this.adults,
        children: this.children,
      },
    });
  }

  // --- Image Loading ---
  availableImages: string[] = ['image_1.jpg', /* ... other images ... */ 'image_30.jpg'];
  heroImageUrl: string = '';
  private usedImageIndices = new Set<number>();

  loadFeaturedHotels(): void {
    /* ... implementation ... */
  }
  createMockHotels(): Hotel[] {
    /* ... implementation ... */ return [];
  }
  getRandomImageUrl(): string {
    /* ... implementation ... */ return '';
  }
  getHotelImageUrl(hotelId: number): string {
    /* ... implementation ... */ return '';
  }
  openExploreMap() {
    this.router.navigate(['/explore-map']);
  }
}
