import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html'
})
export class ChangePasswordComponent {
  message = '';
  private readonly passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+\-=]).{8,64}$/;

  form = this.fb.group({
    oldPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.pattern(this.passwordRegex)]]
  });

  constructor(private readonly fb: FormBuilder, private readonly authService: AuthService) {}

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.authService.changePassword(this.form.getRawValue() as { oldPassword: string; newPassword: string }).subscribe({
      next: (res) => {
        this.message = res.message;
      },
      error: (err) => {
        this.message = err?.error?.message ?? 'Change password failed';
      }
    });
  }
}
