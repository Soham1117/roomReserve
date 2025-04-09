export interface BookedRoom {
  id: number;
  room_type: number;
  room_type_name: string;
  quantity: number;
  price_at_booking: number;
}

export interface BookingGuest {
  id?: number;
  first_name?: string;
  last_name?: string;
  is_primary: boolean;
}

export interface Booking {
  id: number;
  booking_reference: string;
  user: string; // Username
  check_in_date: string; // Format: YYYY-MM-DD
  check_out_date: string; // Format: YYYY-MM-DD
  num_guests: number;
  total_price: string; // String representation of decimal
  status_code: string; // Status code from backend
  special_requests?: string;
  booked_rooms_details: BookedRoom[];
  guests: BookingGuest[];
  created_at: string;
  updated_at: string;
}
