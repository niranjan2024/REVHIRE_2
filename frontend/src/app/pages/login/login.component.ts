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

  form = this.fb.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(6)]]
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
    this.authService.login(payload.username ?? '', payload.password ?? '').subscribe((ok) => {
      if (!ok) {
        this.errorMessage = 'Invalid credentials.';
        return;
      }

      this.errorMessage = '';
      const role = this.authService.getRole();
      this.router.navigate([role === 'employer' ? '/employer-dashboard' : '/job-seeker-dashboard']);
    });
  }
}
