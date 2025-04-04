import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './layout/header/header.component';
import { NotificationDisplayComponent } from './shared/notification-display/notification-display.component'; // Import NotificationDisplayComponent

@Component({
  selector: 'app-root',
  standalone: true, // Add standalone: true
  imports: [
    RouterOutlet,
    HeaderComponent,
    NotificationDisplayComponent, // Add NotificationDisplayComponent here
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'frontend';
}
