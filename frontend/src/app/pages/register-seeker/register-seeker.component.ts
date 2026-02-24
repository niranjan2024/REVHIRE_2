import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ProfileService } from '../../services/profile.service';

@Component({
  selector: 'app-register-seeker',
  templateUrl: './register-seeker.component.html',
  styleUrls: ['./register-seeker.component.css']
})
export class RegisterSeekerComponent {
  errorMessage = '';

  form = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    phone: ['', Validators.required],
    location: ['', Validators.required],
    currentEmploymentStatus: ['Open to work']
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly profileService: ProfileService,
    private readonly router: Router
  ) {}

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = this.form.getRawValue();
    this.authService.registerSeeker(this.form.getRawValue() as any).subscribe((ok) => {
      if (!ok) {
        this.errorMessage = 'Account with this email already exists.';
        return;
      }

      const currentUser = this.authService.getCurrentUser();
      if (!currentUser) {
        this.router.navigate(['/login']);
        return;
      }

      this.profileService
        .updateProfile(currentUser, {
          name: payload.name ?? '',
          phone: payload.phone ?? '',
          location: payload.location ?? '',
          currentEmploymentStatus: payload.currentEmploymentStatus ?? ''
        })
        .subscribe((updated) => {
          this.authService.updateCurrentUser(updated);
          this.router.navigate(['/seeker/profile']);
        });
    });
  }
}
