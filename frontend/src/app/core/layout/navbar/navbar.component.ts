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

  get showGuestAuthLinks(): boolean {
    return !this.authService.isLoggedIn() && this.normalizeUrl(this.router.url) !== '/';
  }

  get isHomeRoute(): boolean {
    return this.normalizeUrl(this.router.url) === '/';
  }

  get showAuthActions(): boolean {
    return this.authService.isLoggedIn() || this.showGuestAuthLinks;
  }

  private normalizeUrl(url: string): string {
    return url.split('?')[0].split('#')[0];
  }
}
