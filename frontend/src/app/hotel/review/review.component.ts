import { Component, Input } from '@angular/core'; // Import Input
import { CommonModule } from '@angular/common'; // Import CommonModule
import { Review } from '../../models/review.model'; // Import Review model

@Component({
  selector: 'app-review',
  standalone: true, // Add standalone: true
  imports: [CommonModule], // Add CommonModule
  templateUrl: './review.component.html',
  styleUrl: './review.component.css',
})
export class ReviewComponent {
  @Input() review!: Review; // Use Review interface, add definite assignment assertion (!)

  constructor() {}
}
