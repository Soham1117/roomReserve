export interface Review {
  id: number; // Changed from string, assuming backend provides it
  hotelId: number; // Changed from string
  userId: number; // Changed from string
  bookingId?: number; // Added optional link to booking
  userName: string; // Renamed from author
  rating: number; // e.g., 1-5
  title?: string; // Added optional title
  comment: string;
  date?: Date | string; // Changed type to allow Date object, made optional
  createdAt?: Date | string; // Added timestamp
  updatedAt?: Date | string; // Added timestamp
}
