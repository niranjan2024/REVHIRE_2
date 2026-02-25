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
  actionMessage = '';
  editingJobId: number | null = null;

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
    const payload = {
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
    };

    if (this.editingJobId !== null) {
      const jobId = this.editingJobId;
      this.jobService.updateJob(jobId, payload).subscribe({
        next: (updatedJob) => {
          this.jobs = this.jobs.map((job) =>
            job.id === jobId
              ? {
                  ...job,
                  ...updatedJob,
                  openings: payload.openings
                }
              : job
          );
          this.actionMessage = 'Job updated successfully.';
          this.clearForm();
        },
        error: () => {
          this.actionMessage = 'Failed to update job.';
        }
      });
      return;
    }

    this.jobService
      .createJob(payload)
      .subscribe(() => {
        this.clearForm();
        this.refresh();
      });
  }

  startEdit(job: JobModel): void {
    this.editingJobId = job.id;
    this.form.patchValue({
      companyName: job.companyName,
      title: job.title,
      description: job.description,
      skills: job.skills.join(', '),
      experienceYears: job.experienceYears,
      education: job.education,
      location: job.location,
      salaryMin: job.salaryMin,
      salaryMax: job.salaryMax,
      jobType: job.jobType,
      deadline: job.deadline,
      openings: job.openings
    });
  }

  cancelEdit(): void {
    this.clearForm();
  }

  updateStatus(jobId: number, status: JobStatus): void {
    const confirmed = window.confirm(`Change status to "${status}"?`);
    if (!confirmed) {
      return;
    }

    const previousStatus = this.jobs.find((job) => job.id === jobId)?.status;
    this.jobs = this.jobs.map((job) => (job.id === jobId ? { ...job, status } : job));

    this.jobService.updateJobStatus(jobId, status).subscribe({
      next: () => {
        this.actionMessage = `Job updated to ${status}.`;
      },
      error: () => {
        if (previousStatus) {
          this.jobs = this.jobs.map((job) => (job.id === jobId ? { ...job, status: previousStatus } : job));
        }
        this.actionMessage = `Failed to update job status to ${status}.`;
      }
    });
  }

  delete(jobId: number): void {
    if (!window.confirm('Delete this job posting?')) {
      return;
    }

    const previousJobs = [...this.jobs];
    this.jobs = this.jobs.filter((job) => job.id !== jobId);

    this.jobService.deleteJob(jobId).subscribe({
      next: () => {
        this.actionMessage = 'Job deleted successfully.';
        this.refresh();
      },
      error: () => {
        this.jobs = previousJobs;
        this.actionMessage = 'Failed to delete job.';
      }
    });
  }

  private clearForm(): void {
    const user = this.authService.getCurrentUser();
    const defaultCompanyName = user ? this.employerService.getCompanyByOwner(user.id)?.name || '' : '';
    this.editingJobId = null;
    this.form.reset({
      companyName: defaultCompanyName
    });
  }
}
