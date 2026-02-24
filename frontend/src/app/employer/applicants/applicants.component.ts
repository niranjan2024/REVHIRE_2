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
    this.search();
  }

  search(): void {
    const user = this.authService.getCurrentUser();
    if (!user) {
      return;
    }

    this.jobService.getJobsByEmployer(user.id).subscribe((jobs) => {
      const raw = this.filtersForm.getRawValue();
      const keyword = (raw.keyword ?? '').toLowerCase();

      this.applicationService.getByJobIds(jobs.map((job) => job.id)).subscribe((applications) => {
        this.applications = applications
          .filter((application) => !raw.status || application.status === raw.status)
          .filter((application) => {
            if (!keyword) {
              return true;
            }

            const combined = [
              application.seekerName,
              application.seekerSkills.join(' '),
              application.seekerExperience.join(' ')
            ]
              .join(' ')
              .toLowerCase();

            return combined.includes(keyword);
          })
          .map((application) => ({
            ...application,
            job: jobs.find((job) => job.id === application.jobId)
          }));
      });
    });
  }

  setStatus(applicationId: number, status: 'Shortlisted' | 'Rejected' | 'Under Review'): void {
    const comment = window.prompt('Optional comment:') ?? undefined;
    this.applicationService.updateStatus(applicationId, status, comment).subscribe(() => {
      this.search();
    });
  }

  saveNote(applicationId: number): void {
    const note = window.prompt('Internal note:');
    if (!note) {
      return;
    }

    this.applicationService.addNote(applicationId, note);
    this.search();
  }
}
