import { HotelImage } from './hotel.model';

export interface Room {
  id: number;
  hotelId: number;
  name: string;
  description?: string;
  capacity: number;
  base_price: number; // Reverted back to base_price
  createdAt?: Date | string;
  updatedAt?: Date | string;
  images?: HotelImage[];
  availableCount?: number;
  priceOverride?: number;
}
