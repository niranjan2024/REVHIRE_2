import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html'
})
export class ForgotPasswordComponent {
  message = '';
  token = '';

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  constructor(private readonly fb: FormBuilder, private readonly authService: AuthService) {}

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.authService.forgotPassword(this.form.getRawValue() as { email: string }).subscribe({
      next: (res) => {
        this.message = res.message;
        this.token = res.resetToken;
      },
      error: (err) => {
        this.message = err?.error?.message ?? 'Request failed';
      }
    });
  }
}
