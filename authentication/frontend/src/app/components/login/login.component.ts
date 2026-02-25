import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent {
  message = '';
  showPassword = false;

  form = this.fb.group({
    usernameOrEmail: ['', Validators.required],
    password: ['', Validators.required]
  });

  constructor(private readonly fb: FormBuilder, private readonly authService: AuthService) {}

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.authService.login(this.form.getRawValue() as { usernameOrEmail: string; password: string }).subscribe({
      next: () => {
        this.message = 'Login successful';
      },
      error: (err) => {
        this.message = err?.error?.message ?? 'Login failed';
      }
    });
  }

  toggleShowPassword(): void {
    this.showPassword = !this.showPassword;
  }
}
