import { Component } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common'; // Import CommonModule and AsyncPipe
import { Observable } from 'rxjs';
import { NotificationService } from '../../services/notification.service'; // Adjust path if needed
import { Notification } from '../../models/notification.model'; // Adjust path if needed

@Component({
  selector: 'app-notification-display',
  standalone: true, // Ensure it's standalone
  imports: [CommonModule, AsyncPipe], // Import necessary modules/pipes
  templateUrl: './notification-display.component.html',
  styleUrls: ['./notification-display.component.css'], // Corrected property name
})
export class NotificationDisplayComponent {
  notifications$: Observable<Notification[]>;

  constructor(private notificationService: NotificationService) {
    this.notifications$ = this.notificationService.notifications$;
  }

  // Method to dismiss a notification
  dismiss(notification: Notification): void {
    if (notification.id) {
      this.notificationService.remove(notification.id);
    } else {
      // Fallback if ID is somehow missing (shouldn't happen with current service logic)
      console.warn(
        'Attempted to dismiss notification without ID:',
        notification
      );
    }
  }

  // Helper to get CSS classes based on notification type
  getNotificationClass(notification: Notification): string {
    switch (notification.type) {
      case 'success':
        return 'bg-green-100 border-green-400 text-green-700';
      case 'error':
        return 'bg-red-100 border-red-400 text-red-700';
      case 'warning':
        return 'bg-yellow-100 border-yellow-400 text-yellow-700';
      case 'info':
      default:
        return 'bg-blue-100 border-blue-400 text-blue-700';
    }
  }
}
