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
  profileImageDataUrl = '';

  form = this.fb.group({
    username: [''],
    email: [''],
    name: ['', Validators.required],
    phone: ['', Validators.required],
    location: ['', Validators.required],
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
      username: user.username ?? '',
      email: user.email ?? '',
      name: user.name,
      phone: user.phone,
      location: user.location,
      skills: user.skills.join(', '),
      education: user.education.join(', '),
      experience: user.experience.join(', '),
      certifications: user.certifications.join(', ')
    });
    this.profileImageDataUrl = user.profileImageDataUrl ?? '';

    this.profileService.getProfile(user.id).subscribe({
      next: (profile) => {
        this.form.patchValue({
          username: user.username ?? '',
          name: profile.fullName ?? user.name,
          email: profile.email ?? user.email,
          phone: profile.phone ?? user.phone,
          location: profile.location ?? user.location
        });

        this.authService.updateCurrentUser({
          ...user,
          name: profile.fullName ?? user.name,
          email: profile.email ?? user.email,
          phone: profile.phone ?? user.phone,
          location: profile.location ?? user.location
        });
      }
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
        email: values.email ?? user.email,
        phone: values.phone ?? user.phone,
        location: values.location ?? user.location,
        skills: this.toArray(values.skills),
        education: this.toArray(values.education),
        experience: this.toArray(values.experience),
        certifications: this.toArray(values.certifications)
      })
      .subscribe((updated) => {
        this.authService.updateCurrentUser({
          ...updated,
          username: values.username ?? updated.username,
          email: values.email ?? updated.email
        });
        this.message = 'Profile updated successfully.';
      });
  }

  uploadProfileImage(event: Event): void {
    const user = this.authService.getCurrentUser();
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!user || !file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      if (!result) {
        return;
      }

      this.profileImageDataUrl = result;
      this.authService.updateCurrentUser({
        ...user,
        profileImageDataUrl: result
      });
    };
    reader.readAsDataURL(file);
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
