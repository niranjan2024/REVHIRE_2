import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  question = '';
  errorMessage = '';
  successMessage = '';

  usernameForm = this.fb.group({
    usernameOrEmail: ['', Validators.required]
  });

  resetForm = this.fb.group({
    answer: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required, Validators.minLength(6)]]
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  fetchQuestion(): void {
    if (this.usernameForm.invalid) {
      this.usernameForm.markAllAsTouched();
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';
    const usernameOrEmail = this.usernameForm.getRawValue().usernameOrEmail ?? '';
    this.authService.getSecurityQuestion(usernameOrEmail).subscribe({
      next: (question) => {
        this.question = question;
      },
      error: () => {
        this.errorMessage = 'User not found.';
      }
    });
  }

  resetPassword(): void {
    if (this.resetForm.invalid || this.usernameForm.invalid) {
      this.resetForm.markAllAsTouched();
      this.usernameForm.markAllAsTouched();
      return;
    }

    const value = this.resetForm.getRawValue();
    if (value.newPassword !== value.confirmPassword) {
      this.errorMessage = 'Password and confirm password must match.';
      return;
    }

    const usernameOrEmail = this.usernameForm.getRawValue().usernameOrEmail ?? '';
    this.authService.resetPassword(usernameOrEmail, value.answer ?? '', value.newPassword ?? '').subscribe({
      next: () => {
        this.successMessage = 'Password reset successful. Please login.';
        this.errorMessage = '';
        setTimeout(() => this.router.navigate(['/login']), 800);
      },
      error: () => {
        this.errorMessage = 'Invalid security answer or password reset failed.';
        this.successMessage = '';
      }
    });
  }
}
