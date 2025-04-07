import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ElementRef,
  ViewChild,
  ViewChildren, // Import ViewChildren
  QueryList, // Import QueryList
  Renderer2,
} from '@angular/core';
import { CommonModule } from '@angular/common';

interface ContinentData {
  name: string;
  svg: string;
  images: string[];
  nameChars?: string[]; // Keep character array
}

@Component({
  selector: 'app-continent-list',
  standalone: true,
  imports: [CommonModule], // Add the pipe
  templateUrl: './continent-list.component.html',
  styleUrls: ['./continent-list.component.css'],
})
export class ContinentListComponent implements OnInit, OnDestroy, AfterViewInit {
  // Keep background image ViewChild
  @ViewChild('backgroundImages') backgroundImagesElement!: ElementRef;
  // Use ViewChildren for the list items
  @ViewChildren('continentItem') continentItems!: QueryList<ElementRef>;

  hoveredContinent: ContinentData | null = null;
  currentImageSlots: (string | null)[] = [null, null, null];
  previousImageSlots: (string | null)[] = [null, null, null];
  currentSlotState: ('entering' | 'idle')[] = ['idle', 'idle', 'idle'];
  previousSlotState: ('exiting' | 'idle')[] = ['idle', 'idle', 'idle'];
  animatedText: string = '';
  svgPosition: { top: string; left: string } = { top: '0px', left: '0px' };

  // Store multiple observers, one for each list item and one for the background
  private itemObservers: IntersectionObserver[] = [];
  private backgroundObserver: IntersectionObserver | null = null;

  continents: ContinentData[] = [
    {
      name: 'North America',
      svg: '/1.svg',
      images: [
        '/compressed/image_1_a_compressed.jpg',
        '/compressed/image_7_a_compressed.jpg',
        '/compressed/image_18_a_compressed.jpg',
      ],
    },
    {
      name: 'South America',
      svg: '/2.svg',
      images: [
        '/compressed/image_2_a_compressed.jpg',
        '/compressed/image_8_a_compressed.jpg',
        '/compressed/image_19_a_compressed.jpg',
      ],
    },
    {
      name: 'Europe',
      svg: '/3.svg',
      images: [
        '/compressed/image_3_a_compressed.jpg',
        '/compressed/image_9_a_compressed.jpg',
        '/compressed/image_20_a_compressed.jpg',
      ],
    },
    {
      name: 'Africa',
      svg: '/7.svg',
      images: [
        '/compressed/image_4_a_compressed.jpg',
        '/compressed/image_10_a_compressed.jpg',
        '/compressed/image_21_a_compressed.jpg',
      ],
    },
    {
      name: 'Asia',
      svg: '/5.svg',
      images: [
        '/compressed/image_5_a_compressed.jpg',
        '/compressed/image_11_a_compressed.jpg',
        '/compressed/image_22_a_compressed.jpg',
      ],
    },
    {
      name: 'Oceania',
      svg: '/6.svg',
      images: [
        '/compressed/image_6_a_compressed.jpg',
        '/compressed/image_12_a_compressed.jpg',
        '/compressed/image_23_a_compressed.jpg',
      ],
    },
  ];

  constructor(
    private el: ElementRef, // Keep for background observer if needed
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    // Split names into characters for animation
    this.continents.forEach((c) => (c.nameChars = c.name.split('')));
  }

  ngAfterViewInit(): void {
    this.setupItemIntersectionObservers();
    this.setupBackgroundIntersectionObserver(); // Keep observer for background fix/unfix
  }

  ngOnDestroy(): void {
    // Disconnect all item observers
    this.itemObservers.forEach((observer) => observer.disconnect());
    // Disconnect background observer
    if (this.backgroundObserver) {
      this.backgroundObserver.disconnect();
    }
  }

  onContinentHover(continent: ContinentData): void {
    if (this.hoveredContinent === continent) {
      return;
    }

    this.previousImageSlots = [...this.currentImageSlots];
    this.previousSlotState = ['exiting', 'exiting', 'exiting'];

    this.currentImageSlots = [
      continent.images[0] || null,
      continent.images[1] || null,
      continent.images[2] || null,
    ];
    this.currentSlotState = ['entering', 'entering', 'entering'];

    setTimeout(() => {
      this.previousImageSlots = [null, null, null];
      this.previousSlotState = ['idle', 'idle', 'idle'];
    }, 800);

    this.hoveredContinent = continent;
    this.animatedText = continent.name; // Keep simple text display
    this.randomizeSvgPosition();
  }

  onMouseLeaveList(): void {
    if (!this.hoveredContinent) return;

    this.previousImageSlots = [...this.currentImageSlots];
    this.previousSlotState = ['exiting', 'exiting', 'exiting'];

    this.currentImageSlots = [null, null, null];
    this.currentSlotState = ['idle', 'idle', 'idle'];

    setTimeout(() => {
      this.previousImageSlots = [null, null, null];
      this.previousSlotState = ['idle', 'idle', 'idle'];
    }, 800);

    this.hoveredContinent = null;
  }

  randomizeSvgPosition(): void {
    const randLeft = Math.floor(Math.random() * 10);
    this.svgPosition = {
      top: 0 + 'rem',
      left: randLeft + 'rem',
    };
  }

  // Setup observer for the background image container visibility
  private setupBackgroundIntersectionObserver(): void {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.5, // Keep threshold for background fix/unfix
    };

    this.backgroundObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const bgElement = this.backgroundImagesElement?.nativeElement;
        if (!bgElement) return;

        if (entry.isIntersecting) {
          this.renderer.addClass(bgElement, 'background-fixed');
        } else {
          this.renderer.removeClass(bgElement, 'background-fixed');
        }
      });
    }, options);

    // Observe the host element to trigger background fix/unfix
    this.backgroundObserver.observe(this.el.nativeElement);
  }

  // Setup observers for individual list items to trigger text animation
  private setupItemIntersectionObservers(): void {
    const options = {
      root: null, // Use viewport
      rootMargin: '0px',
      threshold: 0.2, // Trigger when 20% of the item is visible
    };

    this.continentItems.forEach((itemRef) => {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.renderer.addClass(entry.target, 'is-visible');
            // Unobserve after triggering once
            observer.unobserve(entry.target);
          }
          // No 'else' needed if we only animate in once
        });
      }, options);

      observer.observe(itemRef.nativeElement);
      this.itemObservers.push(observer); // Store observer to disconnect later
    });
  }
}
