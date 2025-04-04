// Represents a Booking, aligning with the bookings table
export interface Booking {
  id: number; // Changed from string, assuming backend provides it
  userId: number; // Changed from string
  roomTypeId: number; // Renamed from roomId, changed from string
  bookingReference: string; // Renamed from confirmationNumber, made mandatory
  checkInDate: Date | string; // Changed type
  checkOutDate: Date | string; // Changed type
  numGuests: number; // Renamed from guests
  totalPrice: number;
  // Status aligned with backend booking_statuses table
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';
  createdAt?: Date | string; // Renamed from bookedAt, changed type
  updatedAt?: Date | string; // Added timestamp

  // Removed denormalized fields (hotelName, roomType, hotelId)
  // These should be fetched/joined via related IDs (userId, roomTypeId -> hotelId)
}
