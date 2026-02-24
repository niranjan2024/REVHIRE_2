import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register-employer',
  templateUrl: './register-employer.component.html',
  styleUrls: ['./register-employer.component.css']
})
export class RegisterEmployerComponent {
  errorMessage = '';

  form = this.fb.group({
    accountName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    phone: ['', Validators.required],
    location: ['', Validators.required],
    companyName: ['', Validators.required],
    industry: ['', Validators.required],
    size: ['', Validators.required],
    description: ['', Validators.required],
    website: ['', Validators.required],
    companyLocation: ['', Validators.required]
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
    this.authService
      .registerEmployer({
        name: payload.accountName ?? '',
        email: payload.email ?? '',
        password: payload.password ?? '',
        phone: payload.phone ?? '',
        location: payload.location ?? '',
        companyName: payload.companyName ?? '',
        industry: payload.industry ?? '',
        companySize: payload.size ?? '',
        companyDescription: payload.description ?? '',
        website: payload.website ?? '',
        companyLocation: payload.companyLocation ?? ''
      } as any)
      .subscribe((ok) => {
        if (!ok) {
          this.errorMessage = 'Account with this email already exists.';
          return;
        }

        this.router.navigate(['/employer/dashboard']);
      });
  }
}
