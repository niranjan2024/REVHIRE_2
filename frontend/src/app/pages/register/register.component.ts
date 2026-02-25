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
    password: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/)]],
    confirmPassword: ['', [Validators.required, Validators.minLength(8)]],
    securityQuestion: ['', Validators.required],
    securityAnswer: ['', Validators.required],
    role: ['', Validators.required],
    fullName: ['', Validators.required],
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
    this.errorMessage = '';
    this.successMessage = '';

    if (this.form.invalid) {
      if (this.form.get('mobileNumber')?.hasError('pattern')) {
        this.errorMessage = 'Mobile number must be exactly 10 digits.';
      } else if (this.form.get('email')?.hasError('email')) {
        this.errorMessage = 'Please enter a valid email address.';
      } else if (this.form.get('password')?.hasError('minlength') || this.form.get('password')?.hasError('pattern')) {
        this.errorMessage = 'Password must include uppercase, lowercase, number, special character and be at least 8 characters.';
      } else if (this.form.get('confirmPassword')?.hasError('minlength')) {
        this.errorMessage = 'Confirm password must be at least 8 characters.';
      } else if (this.form.get('role')?.hasError('required')) {
        this.errorMessage = 'Please choose your role.';
      } else if (this.form.get('securityQuestion')?.hasError('required')) {
        this.errorMessage = 'Please choose a security question.';
      } else if (this.form.get('securityAnswer')?.hasError('required')) {
        this.errorMessage = 'Please enter a security answer.';
      } else {
        this.errorMessage = 'Please fill all required fields correctly.';
      }
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();

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
        this.successMessage = 'Registration Successfull';

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
