import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService, RegisterPayload } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  errorMessage = '';
  successMessage = '';
  showPassword = false;
  showConfirmPassword = false;

  form = this.fb.group({
    username: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    mobileNumber: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required, Validators.minLength(6)]],
    securityQuestion: ['', Validators.required],
    securityAnswer: ['', Validators.required],
    role: ['', Validators.required],
    fullName: [''],
    location: [''],
    employmentStatus: [''],
    companyName: [''],
    industry: [''],
    companySize: [''],
    companyDescription: [''],
    website: [''],
    companyLocation: ['']
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  get isEmployer(): boolean {
    return this.form.get('role')?.value === 'EMPLOYER';
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    this.errorMessage = '';
    this.successMessage = '';

    if (value.password !== value.confirmPassword) {
      this.errorMessage = 'Password and confirm password must match.';
      return;
    }

    const payload: RegisterPayload = {
      username: value.username ?? '',
      email: value.email ?? '',
      mobileNumber: value.mobileNumber ?? '',
      password: value.password ?? '',
      confirmPassword: value.confirmPassword ?? '',
      securityQuestion: value.securityQuestion ?? '',
      securityAnswer: value.securityAnswer ?? '',
      role: (value.role as 'JOB_SEEKER' | 'EMPLOYER') ?? 'JOB_SEEKER',
      fullName: value.fullName ?? '',
      location: value.location ?? '',
      employmentStatus: value.employmentStatus ?? '',
      companyName: value.companyName ?? '',
      industry: value.industry ?? '',
      companySize: value.companySize ?? '',
      companyDescription: value.companyDescription ?? '',
      website: value.website ?? '',
      companyLocation: value.companyLocation ?? ''
    };

    this.authService.registerOnly(payload).subscribe({
      next: () => {
        const roleText = payload.role === 'EMPLOYER' ? 'employer' : 'job_seeker';
        this.successMessage = `Registration successful as ${roleText}. Redirecting to login page...`;

        setTimeout(() => {
          this.router.navigate(['/login'], { replaceUrl: true });
        }, 1500);
      },
      error: (error: HttpErrorResponse) => {
        if (error.status === 0) {
          this.errorMessage = 'Backend server is not reachable. Start backend and try again.';
          return;
        }

        if (typeof error.error === 'string' && error.error.trim().length > 0) {
          this.errorMessage = error.error;
          return;
        }

        if (error.error?.message) {
          this.errorMessage = error.error.message;
          return;
        }

        if (error.message) {
          this.errorMessage = error.message;
          return;
        }

        this.errorMessage = 'Registration failed. Please check details.';
      }
    });
  }
}
