import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserModel } from '../models/user.model';
import { API_BASE_URL } from './config/api.config';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  constructor(private readonly http: HttpClient) {}

  updateProfile(user: UserModel, payload: Partial<UserModel>): Observable<UserModel> {
    const experienceYears = this.firstNumber(payload.experience?.[0] ?? user.experience[0]);
    return this.http
      .post(`${API_BASE_URL}/jobseeker/profile`, {
        userId: user.id,
        fullName: payload.name ?? user.name,
        phone: payload.phone ?? user.phone,
        location: payload.location ?? user.location,
        experience: experienceYears
      })
      .pipe(
        map(() => ({
          ...user,
          ...payload,
          skills: payload.skills ?? user.skills,
          education: payload.education ?? user.education,
          experience: payload.experience ?? user.experience,
          certifications: payload.certifications ?? user.certifications
        }))
      );
  }

  updateResume(
    user: UserModel,
    objective: string,
    education: string[],
    experience: string[],
    skills: string[],
    projects: string[],
    certifications: string[]
  ): Observable<UserModel> {
    return this.http
      .post(`${API_BASE_URL}/resume`, {
        userId: user.id,
        objective,
        degree: education[0] ?? '',
        institution: '',
        startYear: '',
        endYear: '',
        jobTitle: experience[0] ?? '',
        company: '',
        expStartDate: '',
        expEndDate: '',
        skills
      })
      .pipe(
        map(() => ({
          ...user,
          resume: {
            objective,
            education,
            experience,
            skills,
            projects,
            certifications
          }
        }))
      );
  }

  updateUploadedResume(user: UserModel, fileName: string): UserModel {
    return {
      ...user,
      uploadedResumeName: fileName
    };
  }

  private firstNumber(value?: string): number {
    if (!value) {
      return 0;
    }

    const match = value.match(/\d+/);
    return match ? Number(match[0]) : 0;
  }
}
