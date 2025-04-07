import { Review } from './review.model';
import { Room } from './room.model';

// Define Amenity interface based on backend schema
export interface Amenity {
  id: number;
  name: string;
  description?: string;
}

// Define HotelImage interface based on backend serializer
export interface HotelImage {
  id: number;
  image_high_res: string; // URL to high-res image
  image_compressed: string; // URL to compressed image
  caption?: string;
  is_primary: boolean;
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
  images?: HotelImage[]; // Array of hotel images from the backend
  room_types?: Room[]; // Renamed from 'rooms' to match backend serializer, assuming Room is the correct interface
  reviews?: Review[]; // List of reviews (likely fetched separately)
  created_at?: Date | string; // Renamed from createdAt to match backend
  updated_at?: Date | string; // Renamed from updatedAt to match backend
}
