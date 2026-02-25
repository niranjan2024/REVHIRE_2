import { Component, OnInit } from '@angular/core';
import { NotificationModel } from '../../models/notification.model';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-notification-center',
  templateUrl: './notification-center.component.html',
  styleUrls: ['./notification-center.component.css']
})
export class NotificationCenterComponent implements OnInit {
  notifications: NotificationModel[] = [];

  constructor(
    private readonly authService: AuthService,
    private readonly notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    const user = this.authService.getCurrentUser();
    if (!user) {
      return;
    }

    this.notificationService.getForUser(user.id).subscribe((notifications) => {
      this.notifications = notifications;
    });
  }

  markAsRead(notificationId: number): void {
    const current = this.notifications.find((item) => item.id === notificationId);
    if (!current || current.isRead) {
      return;
    }

    this.notificationService.markAsRead(notificationId).subscribe(() => {
      this.notifications = this.notifications.map((notification) =>
        notification.id === notificationId ? { ...notification, isRead: true } : notification
      );
    });
  }
}
