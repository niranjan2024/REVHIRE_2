import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ApplicationModel } from '../../models/application.model';
import { JobModel } from '../../models/job.model';
import { ApplicationService } from '../../services/application.service';
import { AuthService } from '../../services/auth.service';
import { JobService } from '../../services/job.service';

@Component({
  selector: 'app-applicants',
  templateUrl: './applicants.component.html',
  styleUrls: ['./applicants.component.css']
})
export class ApplicantsComponent implements OnInit {
  applications: Array<ApplicationModel & { job?: JobModel }> = [];
  private allApplications: Array<ApplicationModel & { job?: JobModel }> = [];
  statusMessage = '';

  filtersForm = this.fb.group({
    status: [''],
    keyword: ['']
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly jobService: JobService,
    private readonly applicationService: ApplicationService
  ) {}

  ngOnInit(): void {
    this.filtersForm.valueChanges.subscribe(() => this.applyFilters());
    this.search();
  }

  search(): void {
    const user = this.authService.getCurrentUser();
    if (!user) {
      return;
    }

    this.jobService.getJobsByEmployer(user.id).subscribe((jobs) => {
      this.applicationService.getByJobIds(jobs.map((job) => job.id)).subscribe((applications) => {
        this.allApplications = applications.map((application) => ({
          ...application,
          job: jobs.find((job) => job.id === application.jobId)
        }));
        this.applyFilters();
      });
    });
  }

  private applyFilters(): void {
    const raw = this.filtersForm.getRawValue();
    const keyword = (raw.keyword ?? '').toLowerCase().trim();
    const status = (raw.status ?? '').trim();

    this.applications = this.allApplications
      .filter((application) => !status || application.status === status)
      .filter((application) => {
        if (!keyword) {
          return true;
        }

        const combined = [application.seekerName, application.seekerSkills.join(' '), application.seekerExperience.join(' ')]
          .join(' ')
          .toLowerCase();

        return combined.includes(keyword);
      });
  }

  setStatus(applicationId: number, status: 'Shortlisted' | 'Rejected' | 'Under Review'): void {
    const comment = window.prompt('Optional comment:') ?? undefined;
    this.applicationService.updateStatus(applicationId, status, comment).subscribe({
      next: () => {
        this.statusMessage = `Application moved to ${status}.`;
        this.search();
      },
      error: () => {
        this.statusMessage = `Failed to change status to ${status}. Please try again.`;
      }
    });
  }

  saveNote(applicationId: number): void {
    const note = window.prompt('Internal note:');
    if (!note) {
      return;
    }

    this.applicationService.addNote(applicationId, note).subscribe({
      next: () => {
        this.statusMessage = 'Internal note saved.';
        this.search();
      },
      error: () => {
        this.statusMessage = 'Failed to save internal note.';
      }
    });
  }
}
