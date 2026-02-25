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
  profileMenuOpen = false;

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
    this.profileMenuOpen = false;
    this.authService.logout();
    this.router.navigate(['/']);
  }

  toggleProfileMenu(): void {
    this.profileMenuOpen = !this.profileMenuOpen;
  }

  openProfile(): void {
    this.profileMenuOpen = false;
    const route = this.authService.getRole() === 'seeker' ? '/seeker/profile' : '/employer/dashboard';
    this.router.navigate([route]);
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

  get isForgotPasswordRoute(): boolean {
    return this.normalizeUrl(this.router.url) === '/forgot-password';
  }

  private normalizeUrl(url: string): string {
    return url.split('?')[0].split('#')[0];
  }
}
