import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent {
  message = '';
  errorMessage = '';

  form = this.fb.group({
    oldPassword: ['', [Validators.required, Validators.minLength(6)]],
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required, Validators.minLength(6)]]
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  submit(): void {
    this.message = '';
    this.errorMessage = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    if (value.newPassword !== value.confirmPassword) {
      this.errorMessage = 'New password and confirm password must match.';
      return;
    }

    this.authService.changePassword(value.oldPassword ?? '', value.newPassword ?? '').subscribe((ok) => {
      if (!ok) {
        this.errorMessage = 'Failed to change password. Check old password and try again.';
        return;
      }

      this.message = 'Password changed successfully.';
      this.form.reset();
      setTimeout(() => {
        const role = this.authService.getRole();
        this.router.navigate([role === 'employer' ? '/employer/dashboard' : '/seeker/jobs']);
      }, 700);
    });
  }
}
