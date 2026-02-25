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
    companyName: ['', Validators.required],
    title: ['', Validators.required],
    description: ['', Validators.required],
    skills: ['', Validators.required],
    experienceYears: [null as number | null, Validators.required],
    education: ['', Validators.required],
    location: ['', Validators.required],
    salaryMin: [null as number | null, Validators.required],
    salaryMax: [null as number | null, Validators.required],
    jobType: ['', Validators.required],
    deadline: ['', Validators.required],
    openings: [null as number | null, Validators.required]
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

    const data = this.form.getRawValue();
    const companyName = data.companyName?.trim() || this.employerService.getCompanyByOwner(user.id)?.name || '';

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
        const currentCompanyName = this.form.getRawValue().companyName ?? '';
        this.form.reset({
          companyName: currentCompanyName
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
