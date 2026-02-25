import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ProfileService } from '../../services/profile.service';

@Component({
  selector: 'app-resume-builder',
  templateUrl: './resume-builder.component.html',
  styleUrls: ['./resume-builder.component.css']
})
export class ResumeBuilderComponent implements OnInit {
  message = '';
  uploadMessage = '';

  form = this.fb.group({
    objective: [''],
    education: [''],
    experience: [''],
    skills: [''],
    projects: [''],
    certifications: ['']
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly profileService: ProfileService
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (!user?.resume) {
      return;
    }

    this.form.patchValue({
      objective: user.resume.objective,
      education: user.resume.education.join(', '),
      experience: user.resume.experience.join(', '),
      skills: user.resume.skills.join(', '),
      projects: user.resume.projects.join(', '),
      certifications: user.resume.certifications.join(', ')
    });
  }

  saveTextResume(): void {
    const user = this.authService.getCurrentUser();
    if (!user) {
      return;
    }

    const value = this.form.getRawValue();
    this.profileService
      .updateResume(
        user,
        value.objective ?? '',
        this.toArray(value.education),
        this.toArray(value.experience),
        this.toArray(value.skills),
        this.toArray(value.projects),
        this.toArray(value.certifications)
      )
      .subscribe((updated) => {
        this.authService.updateCurrentUser(updated);
        this.message = 'Text resume saved.';
      });
  }

  uploadResume(event: Event): void {
    const user = this.authService.getCurrentUser();
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!user || !file) {
      return;
    }

    const validExtensions = ['pdf', 'doc', 'docx'];
    const extension = file.name.split('.').pop()?.toLowerCase() ?? '';

    if (!validExtensions.includes(extension)) {
      this.uploadMessage = 'Only PDF/DOC/DOCX allowed.';
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      this.uploadMessage = 'Max file size is 2MB.';
      return;
    }

    const updated = this.profileService.updateUploadedResume(user, file.name);
    this.authService.updateCurrentUser(updated);
    this.uploadMessage = `Uploaded: ${file.name}`;
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
