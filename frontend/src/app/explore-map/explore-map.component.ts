import {
  Component,
  OnInit,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  Renderer2,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import Globe from 'globe.gl';
import { SearchService } from '../search/search.service';
import { Hotel, HotelImage } from '../models/hotel.model'; // Import HotelImage
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { FindPrimaryImagePipe } from '../shared/pipes/find-primary-image.pipe'; // Import the pipe

const continentColors: { [key: string]: string } = {
  'North America': '#FF5733',
  'South America': '#33FF57',
  Europe: '#3357FF',
  Africa: '#FFD700',
  Asia: '#FF33A1',
  Oceania: '#33FFF3',
  Antarctica: '#FFFFFF',
  Other: '#CCCCCC',
};

const continentIcons: { [key: string]: string } = {
  'North America': '1.svg',
  'South America': '2.svg',
  Europe: '3.svg',
  Africa: '4.svg',
  Asia: '5.svg',
  Oceania: '6.svg',
  Antarctica: '7.svg',
  Other: '8.svg',
};

function getContinent(lat: number, lng: number): string {
  if (lat > 10 && lng > -170 && lng < -50) return 'North America';
  if (lat < 10 && lat > -60 && lng > -90 && lng < -30) return 'South America';
  if (lat > 35 && lng > -10 && lng < 40) return 'Europe';
  if (lat < 35 && lat > -35 && lng > -20 && lng < 55) return 'Africa';
  if (lat > 0 && lng > 40 && lng < 180) return 'Asia';
  if (lat < 0 && lng > 110 && lng < 180) return 'Oceania';
  if (lat < -0 && lng > -90 && lng < 0) return 'Oceania';
  if (lat < -60) return 'Antarctica';
  return 'Other';
}

@Component({
  selector: 'app-explore-map',
  standalone: true,
  imports: [CommonModule, FindPrimaryImagePipe], // Add the pipe
  templateUrl: './explore-map.component.html',
  styleUrls: ['./explore-map.component.css'],
})
export class ExploreMapComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('globeContainer') globeContainer!: ElementRef;
  private globeInstance: any;
  hotels: Hotel[] = [];
  isLoading = false;
  errorMessage: string | null = null;
  isFilterOpen = false;
  selectedContinents: Set<string> = new Set();

  continents = Object.keys(continentColors).filter((c) => c !== 'Other' && c !== 'Antarctica');
  continentColors = continentColors;
  continentIcons = continentIcons;

  constructor(
    private searchService: SearchService,
    private router: Router,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    this.loadHotels();
  }

  ngAfterViewInit(): void {
    this.initializeGlobe();
  }

  ngOnDestroy(): void {
    if (this.globeInstance) {
      this.globeInstance._destructor();
    }
  }

  private initializeGlobe(): void {
    if (this.globeContainer && this.globeContainer.nativeElement) {
      this.globeInstance = new (Globe as any)()(this.globeContainer.nativeElement)
        .globeImageUrl('//unpkg.com/three-globe/example/img/earth-dark.jpg')
        .backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png')
        .showAtmosphere(true)
        .atmosphereColor('white');

      this.setupGlobePoints();

      this.globeInstance.controls().autoRotate = false;
      this.globeInstance.controls().autoRotateSpeed = 0.1;
      this.globeInstance.controls().enableZoom = true;
    } else {
      console.error('Globe container not found!');
    }
  }

  private loadHotels(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.searchService.searchHotels({}).subscribe({
      next: (hotels) => {
        this.hotels = hotels.filter((h) => h.latitude != null && h.longitude != null);
        this.isLoading = false;
        if (this.globeInstance) {
          this.setupGlobePoints();
        }
      },
      error: (err: HttpErrorResponse) => {
        this.errorMessage = err.message || 'Failed to load hotels.';
        this.isLoading = false;
        console.error('Error loading hotels:', err);
      },
    });
  }

  private setupGlobePoints(): void {
    if (!this.globeInstance) {
      console.warn('Globe not initialized yet, skipping point setup.');
      return;
    }

    const filteredHotels = this.hotels.filter(
      (hotel) =>
        this.selectedContinents.size === 0 ||
        this.selectedContinents.has(getContinent(hotel.latitude!, hotel.longitude!))
    );

    const pointsData = filteredHotels.map((hotel) => {
      const continent = getContinent(hotel.latitude!, hotel.longitude!);
      const color = this.continentColors[continent] || this.continentColors['Other'];
      return {
        lat: hotel.latitude,
        lng: hotel.longitude,
        size: 0.3,
        color: color,
        continent: continent,
        name: hotel.name,
        city: hotel.city,
        hotel: hotel,
      };
    });

    if (this.globeInstance.htmlElementsData().length > 0) {
      this.globeInstance.htmlElementsData([]);
    }

    this.globeInstance.htmlElementsData(pointsData).htmlElement((d: any) => {
      const el = document.createElement('div');
      const continent = d.continent;
      const color = d.color;

      el.innerHTML = `<img src="${continentIcons[continent]}" width="48" height="48" style="filter: drop-shadow(0px 0px 3px rgba(0,0,0,0.5))"/>`;
      el.style.width = `48px`;
      el.style.height = `48px`;
      el.style.pointerEvents = 'auto';
      el.style.cursor = 'pointer';
      el.style.transform = 'translate(-50%, -100%)';

      el.addEventListener('mouseout', () => {
        this.handlePointHover(null);
      });

      el.addEventListener('click', () => {
        this.handlePointHover(d);
      });

      return el;
    });
  }

  public handlePointClick(point: any | null): void {
    if (point && point.hotel) {
      const hotel = point.hotel as Hotel;
      console.log('Clicked Hotel:', hotel.name);
      this.router.navigate(['/hotel', hotel.id]);
    }
  }

  private handlePointHover(point: any | null): void {
    const tooltipId = 'globe-tooltip';
    let tooltip = document.getElementById(tooltipId);
    this.globeContainer.nativeElement.style.cursor = point ? 'pointer' : 'grab';

    if (point) {
      if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.id = tooltipId;
        tooltip.style.position = 'absolute';
        tooltip.style.backgroundColor = 'white';
        tooltip.style.color = '#333';
        tooltip.style.borderRadius = '4px';
        tooltip.style.overflow = 'hidden';
        tooltip.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
        tooltip.style.pointerEvents = 'none';
        tooltip.style.zIndex = '100';
        tooltip.style.width = '250px';
        tooltip.style.transition = 'opacity 0.3s';
        tooltip.style.opacity = '0';
        document.body.appendChild(tooltip);
      }

      const hotel = point.hotel as Hotel;
      // Use the pipe logic to find the primary image (or first as fallback)
      const primaryImage: HotelImage | null = new FindPrimaryImagePipe().transform(hotel.images);
      const imageUrl =
        primaryImage?.image_compressed ||
        'https://via.placeholder.com/250x120/333333/808080?text=No+Image'; // Use compressed version

      tooltip.innerHTML = `
      <div style="position: relative;">
        <img src="${imageUrl}" alt="${hotel.name}"
          style="width: 100%; height: 120px; object-fit: cover;">
        <div style="position: absolute; bottom: 0; left: 0; right: 0; padding: 10px;
          background: linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0));">
        </div>
      </div>
      <div style="padding: 12px;">
        <div style="font-weight: bold; font-size: 16px; margin-bottom: 4px;">${hotel.name}</div>
        <div style="font-size: 14px; color: #666;">${hotel.city || ''}, ${
          point.continent || ''
        }</div>
      </div>
    `;

      this.positionTooltipAtPoint(tooltip, point);
      tooltip.style.opacity = '1';

      this.globeContainer.nativeElement.addEventListener('mousemove', this.updateTooltipPosition);
    } else {
      if (tooltip) {
        tooltip.style.opacity = '0';
        this.globeContainer.nativeElement.removeEventListener(
          'mousemove',
          this.updateTooltipPosition
        );

        setTimeout(() => {
          if (tooltip && tooltip.parentNode) {
            tooltip.parentNode.removeChild(tooltip);
          }
        }, 300);
      }
    }
  }

  private updateTooltipPosition = (event: MouseEvent) => {
    const tooltip = document.getElementById('globe-tooltip');
    if (!tooltip) return;

    tooltip.style.transform = 'none';
  };

  private positionTooltipAtPoint(tooltip: HTMLElement, point: any): void {
    try {
      if (this.globeInstance && this.globeInstance.getScreenCoords) {
        const screenCoords = this.globeInstance.getScreenCoords(point.lat, point.lng);

        if (screenCoords) {
          const containerRect = this.globeContainer.nativeElement.getBoundingClientRect();

          const left = screenCoords.x + containerRect.left;
          const top = screenCoords.y + containerRect.top - tooltip.offsetHeight - 10;

          tooltip.style.left = `${left}px`;
          tooltip.style.top = `${top}px`;
          tooltip.style.transform = 'translateX(-50%)';
          return;
        }
      }

      const containerRect = this.globeContainer.nativeElement.getBoundingClientRect();
      tooltip.style.left = `${containerRect.left + containerRect.width / 2}px`;
      tooltip.style.top = `${containerRect.top + containerRect.height / 3}px`;
      tooltip.style.transform = 'translateX(-50%)';
    } catch (error) {
      console.error('Error positioning tooltip:', error);
      tooltip.style.left = '50%';
      tooltip.style.top = '30%';
      tooltip.style.transform = 'translateX(-50%)';
    }
  }

  toggleFilter(): void {
    this.isFilterOpen = !this.isFilterOpen;
  }

  rotateToPoint(lat: number | undefined, lng: number | undefined): void {
    if (lat === undefined || lng === undefined || !this.globeInstance) return;
    const altitude = 1.5;
    const transitionDuration = 1000;
    this.globeInstance.pointOfView({ lat, lng, altitude }, transitionDuration);
  }

  stopAutoRotate(): void {
    if (this.globeInstance) {
      this.globeInstance.controls().autoRotate = false;
    }
  }

  resumeAutoRotate(): void {
    if (this.globeInstance) {
      this.globeInstance.controls().autoRotate = true;
    }
  }

  filterByContinent(continent: string): void {
    if (this.selectedContinents.has(continent)) {
      this.selectedContinents.delete(continent);
    } else {
      this.selectedContinents.add(continent);
    }
    this.setupGlobePoints();
  }

  clearFilters(): void {
    this.selectedContinents.clear();
    this.setupGlobePoints();
  }

  isContinentSelected(continent: string): boolean {
    return this.selectedContinents.has(continent);
  }
}
