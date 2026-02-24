import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { JobModel } from '../../models/job.model';
import { ApplicationService } from '../../services/application.service';
import { AuthService } from '../../services/auth.service';
import { JobFilter, JobService } from '../../services/job.service';

@Component({
  selector: 'app-job-search',
  templateUrl: './job-search.component.html',
  styleUrls: ['./job-search.component.css']
})
export class JobSearchComponent implements OnInit {
  jobs: JobModel[] = [];
  message = '';

  filtersForm = this.fb.group({
    role: [''],
    location: [''],
    experienceYears: [''],
    companyName: [''],
    minSalary: [''],
    maxSalary: [''],
    jobType: ['']
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly jobService: JobService,
    private readonly authService: AuthService,
    private readonly applicationService: ApplicationService
  ) {}

  ngOnInit(): void {
    this.search();
  }

  search(): void {
    const raw = this.filtersForm.getRawValue();
    const filters: JobFilter = {
      role: raw.role || undefined,
      location: raw.location || undefined,
      companyName: raw.companyName || undefined,
      jobType: raw.jobType || undefined,
      experienceYears: raw.experienceYears ? Number(raw.experienceYears) : undefined,
      minSalary: raw.minSalary ? Number(raw.minSalary) : undefined,
      maxSalary: raw.maxSalary ? Number(raw.maxSalary) : undefined
    };

    this.jobService.searchJobs(filters).subscribe((jobs) => {
      this.jobs = jobs;
    });
  }

  apply(job: JobModel): void {
    const seeker = this.authService.getCurrentUser();
    if (!seeker) {
      return;
    }

    const coverLetter = window.prompt('Optional cover letter:') ?? undefined;
    this.applicationService.apply(job.id, seeker, coverLetter).subscribe((result) => {
      this.message = result.message;
    });
  }

  toggleFavorite(job: JobModel): void {
    const seeker = this.authService.getCurrentUser();
    if (!seeker) {
      return;
    }

    this.jobService.toggleFavorite(seeker.id, job.id);
  }

  isFavorite(jobId: number): boolean {
    const seeker = this.authService.getCurrentUser();
    if (!seeker) {
      return false;
    }

    return this.jobService.isFavorite(seeker.id, jobId);
  }
}
