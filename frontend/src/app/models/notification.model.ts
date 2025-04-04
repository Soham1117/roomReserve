export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
  id?: number | string; // Optional ID, could be timestamp or generated
  type: NotificationType;
  message: string;
  duration?: number; // Optional duration in ms, auto-dismiss after this time
}
