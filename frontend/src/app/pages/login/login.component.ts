import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  errorMessage = '';
  showPassword = false;
  showForgotPassword = false;
  securityQuestion = '';
  forgotErrorMessage = '';
  forgotSuccessMessage = '';

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  forgotIdentityForm = this.fb.group({
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

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = this.form.getRawValue();
    this.authService.login(payload.email ?? '', payload.password ?? '').subscribe((ok) => {
      if (!ok) {
        this.errorMessage = 'Invalid credentials.';
        return;
      }

      this.errorMessage = '';
      const role = this.authService.getRole();
      this.router.navigate([role === 'employer' ? '/employer-dashboard' : '/job-seeker-dashboard'], {
        replaceUrl: true
      });
    });
  }

  toggleForgotPassword(): void {
    this.showForgotPassword = !this.showForgotPassword;
    this.forgotErrorMessage = '';
    this.forgotSuccessMessage = '';
    this.securityQuestion = '';
  }

  fetchSecurityQuestion(): void {
    if (this.forgotIdentityForm.invalid) {
      this.forgotIdentityForm.markAllAsTouched();
      return;
    }

    this.forgotErrorMessage = '';
    this.forgotSuccessMessage = '';
    const usernameOrEmail = this.forgotIdentityForm.getRawValue().usernameOrEmail ?? '';
    this.authService.getSecurityQuestion(usernameOrEmail).subscribe({
      next: (question) => {
        this.securityQuestion = question;
      },
      error: () => {
        this.forgotErrorMessage = 'User not found.';
      }
    });
  }

  resetPassword(): void {
    if (this.resetForm.invalid || this.forgotIdentityForm.invalid) {
      this.resetForm.markAllAsTouched();
      this.forgotIdentityForm.markAllAsTouched();
      return;
    }

    const value = this.resetForm.getRawValue();
    if (value.newPassword !== value.confirmPassword) {
      this.forgotErrorMessage = 'Password and confirm password must match.';
      return;
    }

    const usernameOrEmail = this.forgotIdentityForm.getRawValue().usernameOrEmail ?? '';
    this.authService.resetPassword(usernameOrEmail, value.answer ?? '', value.newPassword ?? '').subscribe({
      next: () => {
        this.forgotSuccessMessage = 'Password reset successful. Please login.';
        this.forgotErrorMessage = '';
        this.securityQuestion = '';
        this.resetForm.reset();
      },
      error: () => {
        this.forgotErrorMessage = 'Invalid security answer or password reset failed.';
        this.forgotSuccessMessage = '';
      }
    });
  }
}
