import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ProfileService } from '../../services/profile.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  message = '';

  form = this.fb.group({
    name: ['', Validators.required],
    phone: ['', Validators.required],
    location: ['', Validators.required],
    currentEmploymentStatus: [''],
    skills: [''],
    education: [''],
    experience: [''],
    certifications: ['']
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly profileService: ProfileService
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (!user) {
      return;
    }

    this.form.patchValue({
      name: user.name,
      phone: user.phone,
      location: user.location,
      currentEmploymentStatus: user.currentEmploymentStatus,
      skills: user.skills.join(', '),
      education: user.education.join(', '),
      experience: user.experience.join(', '),
      certifications: user.certifications.join(', ')
    });
  }

  save(): void {
    const user = this.authService.getCurrentUser();
    if (!user || this.form.invalid) {
      return;
    }

    const values = this.form.getRawValue();
    this.profileService
      .updateProfile(user, {
        name: values.name ?? user.name,
        phone: values.phone ?? user.phone,
        location: values.location ?? user.location,
        currentEmploymentStatus: values.currentEmploymentStatus ?? user.currentEmploymentStatus,
        skills: this.toArray(values.skills),
        education: this.toArray(values.education),
        experience: this.toArray(values.experience),
        certifications: this.toArray(values.certifications)
      })
      .subscribe((updated) => {
        this.authService.updateCurrentUser(updated);
        this.message = 'Profile updated.';
      });
  }

  private toArray(value: string | null): string[] {
    if (!value) {
      return [];
    }

    return value
      .split(',')
      .map((item) => item.trim())
      .filter((item) => !!item);
  }
}
