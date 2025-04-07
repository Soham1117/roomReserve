import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  Renderer2,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CalendarModule } from 'primeng/calendar';
import { HoverButtonComponent } from '../hover-button/hover-button.component';
import { format } from 'date-fns';

// Define interface for emitted search data
export interface SearchCriteria {
  destination: string | null;
  checkIn: string | null;
  checkOut: string | null;
  adults: number;
  children: number;
}

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule, CalendarModule, HoverButtonComponent],
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.css'],
})
export class SearchBarComponent implements OnInit {
  // --- Inputs for initial values ---
  @Input() initialDestination: string | null = null;
  @Input() initialRangeDates: Date[] | null = null;
  @Input() initialAdults: number | null = null;
  @Input() initialChildren: number | null = null;

  // --- Output event ---
  @Output() onSearch = new EventEmitter<SearchCriteria>();

  // --- Internal state properties (copied from HomeComponent) ---
  isSearchFocused = false;
  destination: string = '';
  rangeDates: Date[] | null = null;
  adults: number = 2;
  children: number = 0;
  showGuestSelector: boolean = false;

  @ViewChild('dateRangeCalendar') dateRangeCalendar: any;

  constructor(
    private renderer: Renderer2,
    private el: ElementRef
  ) {}

  ngOnInit(): void {
    // Initialize with input values if provided
    this.destination = this.initialDestination || '';
    this.rangeDates = this.initialRangeDates || null;
    this.adults = this.initialAdults !== null ? this.initialAdults : 2;
    this.children = this.initialChildren !== null ? this.initialChildren : 0;
  }

  // --- Search Bar Logic (copied and adapted from HomeComponent) ---
  toggleSearchFocus(state: boolean): void {
    this.isSearchFocused = state;
    // Query within this component's template
    const searchBarElement = this.el.nativeElement.querySelector('.search-bar');
    if (searchBarElement) {
      if (state) {
        this.renderer.addClass(searchBarElement, 'is-focused');
      } else {
        // Don't remove focus immediately on blur, let document click handle it
        // this.renderer.removeClass(searchBarElement, 'is-focused');
      }
    }
  }

  handleBlur(event: FocusEvent): void {
    // We use the document click listener to handle losing focus generally
  }

  onCalendarOpen(): void {
    if (this.showGuestSelector) {
      this.showGuestSelector = false;
    }
  }

  toggleGuestSelector(event: MouseEvent): void {
    event.stopPropagation();
    const opening = !this.showGuestSelector;
    this.showGuestSelector = opening;
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

  // Close popups if clicking outside the search bar container *within this component*
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    // Check if the click was outside the component's element
    if (!this.el.nativeElement.contains(event.target as Node)) {
      if (this.isSearchFocused) {
        this.isSearchFocused = false; // Hide options when clicking outside
        const searchBarElement = this.el.nativeElement.querySelector('.search-bar');
        if (searchBarElement) {
          this.renderer.removeClass(searchBarElement, 'is-focused');
        }
      }
      if (this.showGuestSelector) {
        this.showGuestSelector = false;
      }
    }
  }

  // --- Search Action ---
  triggerSearch(): void {
    if (!this.destination || this.destination.trim() === '') {
      console.log('SearchBarComponent: Destination is empty.');
      // TODO: Add user feedback (e.g., highlight input)
      return;
    }

    const checkInParam = this.rangeDates?.[0] ? format(this.rangeDates[0], 'yyyy-MM-dd') : null;
    const checkOutParam = this.rangeDates?.[1] ? format(this.rangeDates[1], 'yyyy-MM-dd') : null;

    const searchCriteria: SearchCriteria = {
      destination: this.destination.trim(),
      checkIn: checkInParam,
      checkOut: checkOutParam,
      adults: this.adults,
      children: this.children,
    };

    console.log('SearchBarComponent: Emitting search criteria:', searchCriteria);
    this.onSearch.emit(searchCriteria);

    // Hide options after search is triggered
    this.isSearchFocused = false;
    this.showGuestSelector = false;
    const searchBarElement = this.el.nativeElement.querySelector('.search-bar');
    if (searchBarElement) {
      this.renderer.removeClass(searchBarElement, 'is-focused');
    }
  }
}
