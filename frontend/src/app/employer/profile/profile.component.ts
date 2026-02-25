import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { EmployerProfilePayload, EmployerService } from '../../services/employer.service';

@Component({
  selector: 'app-employer-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class EmployerProfileComponent implements OnInit {
  profileMessage = '';

  profileForm = this.fb.group({
    email: ['', Validators.required],
    mobileNumber: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
    companyName: ['', Validators.required],
    industry: ['', Validators.required],
    companySize: ['', Validators.required],
    companyDescription: ['', Validators.required],
    website: [''],
    companyLocation: ['', Validators.required]
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly employerService: EmployerService
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (!user) {
      return;
    }

    this.profileForm.patchValue({
      email: user.email ?? '',
      mobileNumber: user.phone ?? ''
    });
    this.loadCompanyProfile(user.id);
  }

  saveCompanyProfile(): void {
    const user = this.authService.getCurrentUser();
    if (!user || this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const value = this.profileForm.getRawValue();
    const payload: EmployerProfilePayload = {
      userId: user.id,
      email: value.email ?? '',
      mobileNumber: value.mobileNumber ?? '',
      companyName: value.companyName ?? '',
      industry: value.industry ?? '',
      companySize: value.companySize ?? '',
      companyDescription: value.companyDescription ?? '',
      website: value.website ?? '',
      companyLocation: value.companyLocation ?? ''
    };

    this.employerService.updateCompanyProfile(payload).subscribe({
      next: () => {
        this.authService.updateCurrentUser({
          ...user,
          email: payload.email,
          phone: payload.mobileNumber
        });
        this.profileMessage = 'Company profile updated successfully.';
      },
      error: () => {
        this.profileMessage = 'Failed to update company profile.';
      }
    });
  }

  private loadCompanyProfile(userId: number): void {
    this.employerService.getCompanyProfile(userId).subscribe({
      next: (profile) => {
        this.profileForm.patchValue({
          email: profile.email ?? '',
          mobileNumber: profile.mobileNumber ?? '',
          companyName: profile.companyName ?? '',
          industry: profile.industry ?? '',
          companySize: profile.companySize ?? '',
          companyDescription: profile.companyDescription ?? '',
          website: profile.website ?? '',
          companyLocation: profile.companyLocation ?? ''
        });
      },
      error: () => {
        this.profileMessage = 'Unable to load company profile details.';
      }
    });
  }
}
