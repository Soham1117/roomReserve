import { Pipe, PipeTransform } from '@angular/core';
import { HotelImage } from '../../models/hotel.model'; // Adjust path as needed

@Pipe({
  name: 'findPrimaryImage',
  standalone: true, // Make the pipe standalone
})
export class FindPrimaryImagePipe implements PipeTransform {
  transform(images: HotelImage[] | undefined | null): HotelImage | null {
    if (!images || images.length === 0) {
      return null;
    }
    // Find the first image marked as primary
    const primary = images.find((img) => img.is_primary);
    // If no primary found, return the first image in the array as a fallback
    return primary || images[0];
  }
}
