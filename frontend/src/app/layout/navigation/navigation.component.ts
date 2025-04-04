import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router'; // Import RouterLink and RouterLinkActive

@Component({
  selector: 'app-navigation',
  standalone: true, // Add standalone: true
  imports: [RouterLink, RouterLinkActive], // Add RouterLink and RouterLinkActive
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.css',
})
export class NavigationComponent {}
