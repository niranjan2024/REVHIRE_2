import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html'
})
export class ResetPasswordComponent {
  message = '';
  private readonly passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+\-=]).{8,64}$/;

  form = this.fb.group({
    token: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.pattern(this.passwordRegex)]]
  });

  constructor(private readonly fb: FormBuilder, private readonly authService: AuthService) {}

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.authService.resetPassword(this.form.getRawValue() as { token: string; newPassword: string }).subscribe({
      next: (res) => {
        this.message = res.message;
      },
      error: (err) => {
        this.message = err?.error?.message ?? 'Reset password failed';
      }
    });
  }
}
