import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const loggedOutGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    return true;
  }

  const role = authService.getRole();
  return router.createUrlTree([role === 'employer' ? '/employer-dashboard' : '/job-seeker-dashboard']);
};
