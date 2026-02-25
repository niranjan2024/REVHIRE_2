import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  template: `
    <div class="auth-page">
      <div class="background-brand">RevHire</div>
      <div class="auth-shell">
        <div class="auth-tabs" *ngIf="showTabs()">
          <a routerLink="/login" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Login</a>
          <a routerLink="/register" routerLinkActive="active">Register</a>
        </div>
        <div class="auth-content">
          <router-outlet></router-outlet>
        </div>
      </div>
    </div>
  `
})
export class AppComponent {
  constructor(private readonly router: Router) {}

  showTabs(): boolean {
    const url = this.router.url;
    return url === '/login' || url === '/register' || url === '/';
  }
}
