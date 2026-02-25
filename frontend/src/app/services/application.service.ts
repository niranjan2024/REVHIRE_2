import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { ApplicationModel, ApplicationStatus } from '../models/application.model';
import { UserModel } from '../models/user.model';
import { API_BASE_URL } from './config/api.config';

interface BackendApplication {
  applicationId: number;
  status: string;
  coverLetter?: string;
  statusReason?: string;
  employerComment?: string;
  appliedAt: string;
  seekerFullName?: string;
  seekerExperienceYears?: number;
  seekerSkills?: string[];
  skills?: string[] | string;
  resume?: {
    skills?: string[] | string;
  };
  job: {
    jobId: number;
    title?: string;
    companyName?: string;
  };
  user: {
    userId: number;
    fullName?: string;
    username?: string;
    experience?: number;
    skills?: string[] | string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ApplicationService {
  private readonly localApplicationsPrefix = 'revhire.local.applications.';

  constructor(private readonly http: HttpClient) {}

  apply(jobId: number, seeker: UserModel, coverLetter?: string): Observable<{ ok: boolean; message: string }> {
    const experienceYears = this.firstNumber(seeker.experience?.[0]);

    return this.http
      .post(`${API_BASE_URL}/jobseeker/profile`, {
        userId: seeker.id,
        fullName: seeker.name ?? '',
        phone: seeker.phone ?? '',
        location: seeker.location ?? '',
        experience: experienceYears
      })
      .pipe(
        catchError(() => of(null)),
        switchMap(() =>
          this.http.post(`${API_BASE_URL}/resume`, {
            userId: seeker.id,
            objective: seeker.resume?.objective ?? '',
            degree: seeker.education?.[0] ?? '',
            institution: '',
            startYear: '',
            endYear: '',
            jobTitle: seeker.experience?.[0] ?? '',
            company: '',
            expStartDate: '',
            expEndDate: '',
            skills: seeker.skills ?? []
          })
        ),
        catchError(() => of(null)),
        switchMap(() =>
          this.http.post<BackendApplication>(`${API_BASE_URL}/applications/apply`, {
            jobId,
            userId: seeker.id,
            coverLetter: coverLetter ?? null
          })
        ),
        map((application) => {
          this.cacheApplication(seeker.id, this.toFrontend(application));
          return { ok: true, message: 'Application submitted.' };
        }),
        catchError((error: HttpErrorResponse) => {
          if (typeof error.error === 'string' && error.error.trim().length > 0) {
            return of({ ok: false, message: error.error });
          }

          if (error.error?.message) {
            return of({ ok: false, message: error.error.message });
          }

          return of({ ok: false, message: 'Failed to submit application.' });
        })
      );
  }

  getBySeeker(seekerId: number): Observable<ApplicationModel[]> {
    return this.http
      .get<BackendApplication[]>(`${API_BASE_URL}/applications/user/${seekerId}`)
      .pipe(
        map((items) => {
          const remote = items.map((item) => this.toFrontend(item));
          return this.mergeApplications(remote, this.getCachedApplications(seekerId));
        }),
        catchError(() => of(this.getCachedApplications(seekerId)))
      );
  }

  getByJobIds(jobIds: number[]): Observable<ApplicationModel[]> {
    if (!jobIds.length) {
      return of([]);
    }

    return forkJoin(
      jobIds.map((jobId) => this.http.get<BackendApplication[]>(`${API_BASE_URL}/applications/job/${jobId}`))
    ).pipe(map((groups) => groups.flat().map((item) => this.toFrontend(item))));
  }

  updateStatus(applicationId: number, status: ApplicationStatus, comment?: string): Observable<void> {
    if (status === 'Under Review') {
      return this.http
        .put(`${API_BASE_URL}/applications/under-review/${applicationId}`, { comment: comment ?? '' })
        .pipe(map(() => void 0));
    }

    if (status === 'Shortlisted') {
      return this.http.put(`${API_BASE_URL}/applications/shortlist/${applicationId}`, {}).pipe(map(() => void 0));
    }

    if (status === 'Rejected') {
      return this.http
        .put(`${API_BASE_URL}/applications/reject/${applicationId}`, { comment: comment ?? '' })
        .pipe(map(() => void 0));
    }

    return of(void 0);
  }

  withdraw(applicationId: number, userId: number, reason?: string): Observable<void> {
    return this.http
      .put(`${API_BASE_URL}/applications/withdraw/${applicationId}`, {
        userId,
        reason: reason ?? ''
      })
      .pipe(
        map(() => {
          this.updateCachedApplicationStatus(userId, applicationId, 'Withdrawn');
          return void 0;
        })
      );
  }

  addNote(applicationId: number, note: string): Observable<void> {
    return this.http.put(`${API_BASE_URL}/applications/note/${applicationId}`, { comment: note }).pipe(map(() => void 0));
  }

  private toFrontend(application: BackendApplication): ApplicationModel {
    const seekerExperienceYears =
      typeof application.seekerExperienceYears === 'number'
        ? application.seekerExperienceYears
        : typeof application.user.experience === 'number'
          ? application.user.experience
          : undefined;
    const experienceText = typeof seekerExperienceYears === 'number' ? [`${seekerExperienceYears} years`] : [];
    return {
      id: application.applicationId,
      jobId: application.job.jobId,
      jobTitle: application.job.title,
      companyName: application.job.companyName,
      seekerId: application.user.userId,
      seekerName: application.seekerFullName || application.user.fullName || application.user.username || 'Candidate',
      seekerSkills: this.extractSkills(application),
      seekerExperience: experienceText,
      coverLetter: application.coverLetter,
      status: this.normalizeStatus(application.status),
      appliedAt: application.appliedAt,
      comments: application.employerComment,
      note: application.employerComment,
      withdrawReason: application.statusReason
    };
  }

  private normalizeStatus(status: string): ApplicationStatus {
    switch (status) {
      case 'SHORTLISTED':
        return 'Shortlisted';
      case 'REJECTED':
        return 'Rejected';
      case 'WITHDRAWN':
        return 'Withdrawn';
      case 'UNDER_REVIEW':
        return 'Under Review';
      default:
        return 'Applied';
    }
  }

  private firstNumber(value?: string): number {
    if (!value) {
      return 0;
    }

    const match = value.match(/\d+/);
    return match ? Number(match[0]) : 0;
  }

  private extractSkills(application: BackendApplication): string[] {
    const candidates: unknown[] = [application.seekerSkills, application.skills, application.user.skills, application.resume?.skills];

    for (const candidate of candidates) {
      const normalized = this.normalizeSkills(candidate);
      if (normalized.length) {
        return normalized;
      }
    }

    return [];
  }

  private normalizeSkills(value: unknown): string[] {
    if (Array.isArray(value)) {
      return value
        .map((item) => {
          if (typeof item === 'string') {
            return item;
          }

          if (item && typeof item === 'object') {
            const record = item as Record<string, unknown>;
            const fallback = record['skill'] ?? record['name'] ?? record['skillName'];
            return typeof fallback === 'string' ? fallback : '';
          }

          return '';
        })
        .map((item) => item.trim())
        .filter((item) => !!item);
    }

    if (typeof value === 'string') {
      return value
        .split(',')
        .map((item) => item.trim())
        .filter((item) => !!item);
    }

    return [];
  }

  private cacheApplication(seekerId: number, application: ApplicationModel): void {
    const cached = this.getCachedApplications(seekerId);
    const merged = this.mergeApplications([application], cached);
    localStorage.setItem(`${this.localApplicationsPrefix}${seekerId}`, JSON.stringify(merged));
  }

  private getCachedApplications(seekerId: number): ApplicationModel[] {
    try {
      const raw = localStorage.getItem(`${this.localApplicationsPrefix}${seekerId}`);
      if (!raw) {
        return [];
      }

      const parsed = JSON.parse(raw) as unknown;
      return Array.isArray(parsed) ? (parsed as ApplicationModel[]) : [];
    } catch {
      return [];
    }
  }

  private mergeApplications(primary: ApplicationModel[], secondary: ApplicationModel[]): ApplicationModel[] {
    const byId = new Map<number, ApplicationModel>();
    [...secondary, ...primary].forEach((application) => {
      byId.set(application.id, application);
    });
    return Array.from(byId.values()).sort((a, b) => +new Date(b.appliedAt) - +new Date(a.appliedAt));
  }

  private updateCachedApplicationStatus(seekerId: number, applicationId: number, status: ApplicationStatus): void {
    const updated = this.getCachedApplications(seekerId).map((application) =>
      application.id === applicationId ? { ...application, status } : application
    );
    localStorage.setItem(`${this.localApplicationsPrefix}${seekerId}`, JSON.stringify(updated));
  }
}
