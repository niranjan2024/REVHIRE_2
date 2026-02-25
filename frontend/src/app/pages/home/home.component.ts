import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, RegisterPayload } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  activePanel: 'login' | 'register' = 'login';

  loginError = '';
  registerError = '';
  registerSuccess = '';
  showLoginPassword = false;
  showRegisterPassword = false;
  showConfirmPassword = false;

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  registerForm = this.fb.group({
    username: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    mobileNumber: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required, Validators.minLength(6)]],
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
    return this.registerForm.get('role')?.value === 'EMPLOYER';
  }

  openPanel(panel: 'login' | 'register'): void {
    this.activePanel = panel;
  }

  submitLogin(): void {
    this.loginError = '';

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const value = this.loginForm.getRawValue();
    this.authService.login(value.email ?? '', value.password ?? '').subscribe((ok) => {
      if (!ok) {
        this.loginError = 'Invalid credentials.';
        return;
      }

      const role = this.authService.getRole();
      this.router.navigate([role === 'employer' ? '/employer-dashboard' : '/job-seeker-dashboard'], {
        replaceUrl: true
      });
    });
  }

  submitRegister(): void {
    this.registerError = '';
    this.registerSuccess = '';

    if (this.registerForm.invalid) {
      if (this.registerForm.get('mobileNumber')?.hasError('pattern')) {
        this.registerError = 'Mobile number must be exactly 10 digits.';
      } else if (this.registerForm.get('email')?.hasError('email')) {
        this.registerError = 'Please enter a valid email address.';
      } else if (this.registerForm.get('password')?.hasError('minlength')) {
        this.registerError = 'Password must be at least 6 characters.';
      } else if (this.registerForm.get('confirmPassword')?.hasError('minlength')) {
        this.registerError = 'Confirm password must be at least 6 characters.';
      } else if (this.registerForm.get('role')?.hasError('required')) {
        this.registerError = 'Please choose your role.';
      } else if (this.registerForm.get('securityQuestion')?.hasError('required')) {
        this.registerError = 'Please choose a security question.';
      } else if (this.registerForm.get('securityAnswer')?.hasError('required')) {
        this.registerError = 'Please enter a security answer.';
      } else {
        this.registerError = 'Please fill all required fields correctly.';
      }
      this.registerForm.markAllAsTouched();
      return;
    }

    const value = this.registerForm.getRawValue();
    if (value.password !== value.confirmPassword) {
      this.registerError = 'Password and confirm password must match.';
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
        this.registerSuccess = 'Registration Successfull';

        setTimeout(() => {
          this.router.navigate(['/login'], { replaceUrl: true });
        }, 1500);
      },
      error: (error: HttpErrorResponse) => {
        if (error.status === 0) {
          this.registerError = 'Backend server is not reachable. Start backend and try again.';
          return;
        }

        if (typeof error.error === 'string' && error.error.trim().length > 0) {
          this.registerError = error.error;
          return;
        }

        if (error.error?.message) {
          this.registerError = error.error.message;
          return;
        }

        this.registerError = 'Registration failed. Please check details.';
      }
    });
  }
}
