import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core'; // Import Input, Output, EventEmitter, OnInit
import { CommonModule } from '@angular/common'; // Import CommonModule
import { Room } from '../../models/room.model'; // Import Room model

@Component({
  selector: 'app-room-list',
  standalone: true, // Add standalone: true
  imports: [CommonModule], // Add CommonModule
  templateUrl: './room-list.component.html',
  styleUrl: './room-list.component.css',
})
export class RoomListComponent implements OnInit {
  @Input() rooms: Room[] = []; // Use Room interface
  @Output() roomSelected = new EventEmitter<Room>(); // Use Room interface

  constructor() {}

  ngOnInit(): void {
    // If no rooms are provided via Input, use placeholder data
    // In a real app, this data would likely come from the parent (HotelDetailComponent)
    // which fetches it based on selected dates.
    if (!this.rooms || this.rooms.length === 0) {
      // Updated placeholder data for new Room model
      this.rooms = [
        {
          id: 101, // Changed to number
          hotelId: 1, // Added hotelId (assuming hotel 1)
          name: 'Standard Queen', // Renamed from type
          description: 'Comfortable room with one queen bed.',
          capacity: 2, // Added capacity
          basePrice: 120, // Renamed from pricePerNight
          // features removed
        },
        {
          id: 102, // Changed to number
          hotelId: 1, // Added hotelId
          name: 'Deluxe King', // Renamed from type
          description: 'Spacious room with one king bed and city view.',
          capacity: 2, // Added capacity
          basePrice: 180, // Renamed from pricePerNight
          // features removed
        },
        {
          id: 103, // Changed to number
          hotelId: 1, // Added hotelId
          name: 'Suite', // Renamed from type
          description: 'Large suite with separate living area.',
          capacity: 4, // Added capacity (e.g., with sofa bed)
          basePrice: 250, // Renamed from pricePerNight
          // features removed
        },
      ];
    }
  }

  selectRoom(room: Room) {
    // Use Room interface
    console.log('Room selected:', room);
    this.roomSelected.emit(room);
    // TODO: Handle selection logic (e.g., update booking state)
  }
}
