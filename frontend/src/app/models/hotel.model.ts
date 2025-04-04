import { Review } from './review.model';
import { Room } from './room.model';

// Define Amenity interface based on backend schema
export interface Amenity {
  id: number;
  name: string;
  description?: string;
}

export interface Hotel {
  id: number; // Changed from string
  name: string;
  description?: string; // Made optional to match DB
  // Structured address fields
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  latitude?: number; // Added
  longitude?: number; // Added
  star_rating?: string; // Renamed from rating
  // reviewCount removed - can be derived
  // pricePerNight removed - belongs to Room or Availability
  amenities?: Amenity[]; // Changed from string[] to Amenity[]
  imageUrl?: string; // Main image URL (assuming stored elsewhere)
  imageUrls?: string[]; // Gallery images (assuming stored elsewhere)
  rooms?: Room[]; // Available rooms (likely fetched separately)
  reviews?: Review[]; // List of reviews (likely fetched separately)
  createdAt?: Date | string; // Added timestamp
  updatedAt?: Date | string; // Added timestamp
}
