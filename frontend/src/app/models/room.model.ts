// Represents a Room Type, aligning with room_types table
export interface Room {
  id: number; // Changed from string
  hotelId: number; // Changed from string, made mandatory
  name: string; // Renamed from type
  description?: string; // Made optional
  capacity: number; // Added capacity (max guests)
  basePrice: number; // Renamed from pricePerNight
  // features removed - amenities are typically at hotel level or implied by type
  createdAt?: Date | string; // Added timestamp
  updatedAt?: Date | string; // Added timestamp

  // Optional fields populated based on availability search for specific dates
  availableCount?: number; // From room_availability
  priceOverride?: number; // From room_availability (price for specific date)
}
