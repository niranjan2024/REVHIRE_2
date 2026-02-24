import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { JobModel, JobStatus } from '../../models/job.model';
import { AuthService } from '../../services/auth.service';
import { EmployerService } from '../../services/employer.service';
import { JobService } from '../../services/job.service';

@Component({
  selector: 'app-job-postings',
  templateUrl: './job-postings.component.html',
  styleUrls: ['./job-postings.component.css']
})
export class JobPostingsComponent implements OnInit {
  jobs: JobModel[] = [];

  form = this.fb.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    skills: ['', Validators.required],
    experienceYears: [0, Validators.required],
    education: ['', Validators.required],
    location: ['', Validators.required],
    salaryMin: [0, Validators.required],
    salaryMax: [0, Validators.required],
    jobType: ['full-time', Validators.required],
    deadline: ['', Validators.required],
    openings: [1, Validators.required]
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly employerService: EmployerService,
    private readonly jobService: JobService
  ) {}

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    const user = this.authService.getCurrentUser();
    if (!user) {
      return;
    }

    this.jobService.getJobsByEmployer(user.id).subscribe((jobs) => {
      this.jobs = jobs;
    });
  }

  createJob(): void {
    const user = this.authService.getCurrentUser();
    if (!user || this.form.invalid) {
      return;
    }

    const companyName = this.employerService.getCompanyByOwner(user.id)?.name ?? 'My Company';
    const data = this.form.getRawValue();

    this.jobService
      .createJob({
        employerId: user.id,
        companyName,
        title: data.title ?? '',
        description: data.description ?? '',
        skills: (data.skills ?? '')
          .split(',')
          .map((item) => item.trim())
          .filter((item) => !!item),
        experienceYears: Number(data.experienceYears ?? 0),
        education: data.education ?? '',
        location: data.location ?? '',
        salaryMin: Number(data.salaryMin ?? 0),
        salaryMax: Number(data.salaryMax ?? 0),
        jobType: (data.jobType as any) ?? 'full-time',
        deadline: data.deadline ?? '',
        openings: Number(data.openings ?? 1)
      })
      .subscribe(() => {
        this.form.reset({
          experienceYears: 0,
          salaryMin: 0,
          salaryMax: 0,
          jobType: 'full-time',
          openings: 1
        });
        this.refresh();
      });
  }

  updateStatus(jobId: number, status: JobStatus): void {
    this.jobService.updateJobStatus(jobId, status).subscribe(() => this.refresh());
  }

  delete(jobId: number): void {
    if (!window.confirm('Delete this job posting?')) {
      return;
    }

    this.jobService.deleteJob(jobId).subscribe(() => this.refresh());
  }
}
