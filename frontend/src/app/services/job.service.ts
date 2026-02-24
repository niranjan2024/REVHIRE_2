import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { JobModel, JobStatus } from '../models/job.model';
import { API_BASE_URL } from './config/api.config';

export interface JobFilter {
  role?: string;
  location?: string;
  experienceYears?: number;
  companyName?: string;
  minSalary?: number;
  maxSalary?: number;
  jobType?: string;
}

interface BackendJob {
  jobId: number;
  title: string;
  description: string;
  companyName: string;
  location: string;
  education: string;
  requiredExperienceYears: number;
  salaryMin: number;
  salaryMax: number;
  jobType: string;
  deadline: string;
  status: string;
  requiredSkills: string[];
  employer?: {
    userId: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class JobService {
  private favoritesBySeeker = new Map<number, Set<number>>();

  constructor(private readonly http: HttpClient) {}

  getAllJobs(): Observable<JobModel[]> {
    return this.http.get<BackendJob[]>(`${API_BASE_URL}/employer/jobs`).pipe(
      map((jobs) => jobs.map((job) => this.toFrontendJob(job)))
    );
  }

  getJobById(jobId: number): Observable<JobModel | undefined> {
    return this.getAllJobs().pipe(map((jobs) => jobs.find((job) => job.id === jobId)));
  }

  searchJobs(filter: JobFilter): Observable<JobModel[]> {
    let params = new HttpParams();
    if (filter.role) params = params.set('title', filter.role);
    if (filter.location) params = params.set('location', filter.location);
    if (typeof filter.experienceYears === 'number') params = params.set('experienceYears', filter.experienceYears);
    if (filter.companyName) params = params.set('companyName', filter.companyName);
    if (typeof filter.minSalary === 'number') params = params.set('minSalary', filter.minSalary);
    if (typeof filter.maxSalary === 'number') params = params.set('maxSalary', filter.maxSalary);
    if (filter.jobType) params = params.set('jobType', filter.jobType);

    return this.http.get<BackendJob[]>(`${API_BASE_URL}/jobseeker/jobs/search`, { params }).pipe(
      map((jobs) => jobs.map((job) => this.toFrontendJob(job)))
    );
  }

  createJob(payload: Omit<JobModel, 'id' | 'datePosted' | 'status'>): Observable<void> {
    return this.http
      .post(`${API_BASE_URL}/employer/job`, {
        employerId: payload.employerId,
        title: payload.title,
        description: payload.description,
        companyName: payload.companyName,
        education: payload.education,
        requiredExperienceYears: payload.experienceYears,
        location: payload.location,
        salaryMin: payload.salaryMin,
        salaryMax: payload.salaryMax,
        jobType: payload.jobType,
        deadline: payload.deadline,
        requiredSkills: payload.skills
      })
      .pipe(map(() => void 0));
  }

  updateJobStatus(jobId: number, status: JobStatus): Observable<void> {
    if (status === 'filled') {
      return this.deleteJob(jobId);
    }

    const endpoint = status === 'closed' ? 'close' : 'reopen';
    return this.http.put(`${API_BASE_URL}/employer/job/${jobId}/${endpoint}`, {}).pipe(map(() => void 0));
  }

  deleteJob(jobId: number): Observable<void> {
    return this.http.delete(`${API_BASE_URL}/employer/job/${jobId}`).pipe(map(() => void 0));
  }

  getJobsByEmployer(employerId: number): Observable<JobModel[]> {
    return this.getAllJobs().pipe(map((jobs) => jobs.filter((job) => job.employerId === employerId)));
  }

  toggleFavorite(seekerId: number, jobId: number): void {
    if (!this.favoritesBySeeker.has(seekerId)) {
      this.favoritesBySeeker.set(seekerId, new Set<number>());
    }

    const favorites = this.favoritesBySeeker.get(seekerId)!;
    if (favorites.has(jobId)) {
      favorites.delete(jobId);
    } else {
      favorites.add(jobId);
    }
  }

  isFavorite(seekerId: number, jobId: number): boolean {
    return this.favoritesBySeeker.get(seekerId)?.has(jobId) ?? false;
  }

  getFavoriteJobs(seekerId: number): Observable<JobModel[]> {
    const ids = this.favoritesBySeeker.get(seekerId);
    if (!ids || ids.size === 0) {
      return of([]);
    }

    return this.getAllJobs().pipe(map((jobs) => jobs.filter((job) => ids.has(job.id))));
  }

  private toFrontendJob(job: BackendJob): JobModel {
    return {
      id: job.jobId,
      employerId: job.employer?.userId ?? 0,
      companyName: job.companyName,
      title: job.title,
      description: job.description,
      skills: job.requiredSkills ?? [],
      experienceYears: job.requiredExperienceYears ?? 0,
      education: job.education ?? '',
      location: job.location ?? '',
      salaryMin: job.salaryMin ?? 0,
      salaryMax: job.salaryMax ?? 0,
      jobType: this.normalizeJobType(job.jobType),
      deadline: job.deadline ?? '',
      openings: 1,
      datePosted: '',
      status: this.normalizeStatus(job.status)
    };
  }

  private normalizeStatus(status: string): JobStatus {
    return status === 'CLOSED' ? 'closed' : 'active';
  }

  private normalizeJobType(jobType: string): JobModel['jobType'] {
    const value = (jobType || '').toLowerCase();
    if (value === 'part-time' || value === 'contract' || value === 'internship' || value === 'remote') {
      return value;
    }
    return 'full-time';
  }
}
