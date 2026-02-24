import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { NotificationModel, NotificationType } from '../models/notification.model';
import { API_BASE_URL } from './config/api.config';

interface BackendNotification {
  notificationId: number;
  message: string;
  read: boolean;
  user?: {
    userId: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readLocally = new Set<number>();

  constructor(private readonly http: HttpClient) {}

  push(_userId: number, _message: string, _type: NotificationType = 'info'): void {}

  getForUser(userId: number): Observable<NotificationModel[]> {
    return this.http.get<BackendNotification[]>(`${API_BASE_URL}/notifications/user/${userId}`).pipe(
      map((notifications) =>
        notifications.map((notification) => ({
          id: notification.notificationId,
          userId: notification.user?.userId ?? userId,
          message: notification.message,
          type: 'info' as NotificationType,
          createdAt: new Date().toISOString(),
          isRead: notification.read || this.readLocally.has(notification.notificationId)
        }))
      )
    );
  }

  markAsRead(notificationId: number): Observable<void> {
    this.readLocally.add(notificationId);
    return of(void 0);
  }

  getUnreadCount(userId: number): Observable<number> {
    return this.getForUser(userId).pipe(map((items) => items.filter((notification) => !notification.isRead).length));
  }
}
