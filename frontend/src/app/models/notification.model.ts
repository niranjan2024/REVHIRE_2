export type NotificationType = 'info' | 'success' | 'warning';

export interface NotificationModel {
  id: number;
  userId: number;
  message: string;
  type: NotificationType;
  createdAt: string;
  isRead: boolean;
}
