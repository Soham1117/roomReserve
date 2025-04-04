import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Notification, NotificationType } from '../models/notification.model';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  private defaultDuration = 5000; // Default display time in ms

  constructor() {}

  // Method to add a new notification
  show(
    message: string,
    type: NotificationType = 'info',
    duration?: number
  ): void {
    const notification: Notification = {
      id: Date.now() + Math.random(), // Simple unique ID
      message,
      type,
      duration: duration ?? this.defaultDuration,
    };

    // Add the new notification to the list
    const currentNotifications = this.notificationsSubject.getValue();
    this.notificationsSubject.next([...currentNotifications, notification]);

    // Set a timer to remove the notification if duration is provided
    if (notification.duration && notification.duration > 0) {
      setTimeout(() => {
        this.remove(notification.id!);
      }, notification.duration);
    }
  }

  // Convenience methods for different types
  showSuccess(message: string, duration?: number): void {
    this.show(message, 'success', duration);
  }

  showError(message: string, duration?: number): void {
    // Errors often shouldn't auto-dismiss, hence duration 0 or undefined
    this.show(message, 'error', duration ?? 0);
  }

  showInfo(message: string, duration?: number): void {
    this.show(message, 'info', duration);
  }

  showWarning(message: string, duration?: number): void {
    this.show(message, 'warning', duration);
  }

  // Method to remove a notification by its ID
  remove(id: number | string): void {
    const currentNotifications = this.notificationsSubject.getValue();
    const updatedNotifications = currentNotifications.filter(
      (n) => n.id !== id
    );
    this.notificationsSubject.next(updatedNotifications);
  }

  // Method to clear all notifications
  clearAll(): void {
    this.notificationsSubject.next([]);
  }
}
