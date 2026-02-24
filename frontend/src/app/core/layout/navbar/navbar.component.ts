import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  unreadCount = 0;

  constructor(
    public readonly authService: AuthService,
    private readonly notificationService: NotificationService,
    private readonly router: Router
  ) {
    this.authService.currentUser$.subscribe((user) => {
      if (!user) {
        this.unreadCount = 0;
        return;
      }

      this.notificationService.getUnreadCount(user.id).subscribe((count) => {
        this.unreadCount = count;
      });
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
