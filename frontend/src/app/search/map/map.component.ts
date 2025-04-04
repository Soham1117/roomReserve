import {
  Component,
  Input,
  ViewChild,
  SimpleChanges,
  OnChanges,
  AfterViewInit,
} from '@angular/core';
import { GoogleMap, MapMarker, GoogleMapsModule } from '@angular/google-maps';
import { CommonModule } from '@angular/common';
import { Hotel } from '../../models/hotel.model';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule, GoogleMapsModule],
  templateUrl: './map.component.html',
  styleUrl: './map.component.css',
})
export class MapComponent implements OnChanges, AfterViewInit {
  @Input() hotels: Hotel[] = [];
  @ViewChild(GoogleMap) map: GoogleMap | undefined;

  mapOptions: google.maps.MapOptions = {
    center: { lat: 40.7128, lng: -74.006 },
    zoom: 12,
    mapTypeId: 'roadmap',
  };

  markers: google.maps.MarkerOptions[] = [];
  mapInitialized = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['hotels'] && this.hotels) {
      this.updateMarkers();
      if (this.mapInitialized) {
        this.adjustMapBounds();
      }
    }
  }

  ngAfterViewInit(): void {
    this.mapInitialized = true;
    console.log('MapComponent: ngAfterViewInit - Map should be ready.');
    if (this.hotels.length > 0) {
      this.adjustMapBounds();
    }
  }

  updateMarkers(): void {
    console.log('MapComponent: updateMarkers called with hotels:', this.hotels);

    // Filter hotels first to ensure valid coordinates and convert types
    const validHotels = this.hotels.filter((hotel) => {
      const lat = Number(hotel.latitude);
      const lng = Number(hotel.longitude);
      const isValid = !isNaN(lat) && !isNaN(lng);
      if (!isValid && (hotel.latitude != null || hotel.longitude != null)) {
        // Log only if coords were present but invalid
        console.warn(
          `Hotel ${hotel.id} (${hotel.name}) has invalid coordinates: Lat=${hotel.latitude}, Lng=${hotel.longitude}`
        );
      } else if (hotel.latitude == null || hotel.longitude == null) {
        console.log(`Hotel ${hotel.id} (${hotel.name}) missing coordinates.`);
      }
      return isValid;
    });

    // Map the valid hotels to marker options
    this.markers = validHotels.map((hotel) => {
      // We know lat/lng are valid numbers here due to the filter
      const lat = Number(hotel.latitude);
      const lng = Number(hotel.longitude);
      console.log(
        `Creating marker for Hotel ${hotel.id}: Lat=${lat}, Lng=${lng}`
      );
      return {
        position: { lat, lng },
        title: hotel.name,
        // Add other marker options if needed
      };
    });

    console.log('MapComponent: Markers updated', this.markers);
  }

  adjustMapBounds(): void {
    if (!this.map?.googleMap || this.markers.length === 0) {
      console.log(
        'MapComponent: adjustMapBounds - Map not ready or no markers.'
      );
      this.mapOptions = {
        ...this.mapOptions,
        center: { lat: 40.7128, lng: -74.006 },
        zoom: 12,
      };
      return;
    }

    console.log('MapComponent: adjustMapBounds - Adjusting bounds...');
    const bounds = new google.maps.LatLngBounds();
    this.markers.forEach((marker) => {
      if (marker.position) {
        // Position should be valid LatLngLiteral here
        bounds.extend(marker.position);
      }
    });

    if (this.markers.length === 1 && this.markers[0].position) {
      const firstMarkerPos = this.markers[0].position;
      this.mapOptions = {
        ...this.mapOptions,
        center: firstMarkerPos, // Already LatLngLiteral
        zoom: 15,
      };
    } else if (this.markers.length > 1) {
      setTimeout(() => {
        if (this.map?.googleMap) {
          console.log('MapComponent: adjustMapBounds - Calling fitBounds.');
          this.map.googleMap.fitBounds(bounds);
        } else {
          console.warn(
            'MapComponent: adjustMapBounds - Map instance not available for fitBounds.'
          );
        }
      }, 0);
      this.mapOptions = {
        ...this.mapOptions,
        center: undefined,
        zoom: undefined,
      };
    } else {
      console.warn(
        'MapComponent: adjustMapBounds - No valid markers to calculate bounds.'
      );
      this.mapOptions = {
        ...this.mapOptions,
        center: { lat: 40.7128, lng: -74.006 },
        zoom: 12,
      };
    }
    console.log('MapComponent: Bounds adjusted');
  }

  onMarkerClick(event: google.maps.MapMouseEvent): void {
    console.log('Marker clicked event:', event);
    console.log('Clicked coordinates:', event.latLng?.toJSON());
  }
}
