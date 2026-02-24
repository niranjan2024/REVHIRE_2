import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { UserModel, UserRole } from '../models/user.model';
import { API_BASE_URL } from './config/api.config';

interface LoginResponse {
  userId: number;
  username: string;
  role: string;
  fullName?: string;
}

export interface RegisterPayload {
  username: string;
  email?: string;
  password: string;
  confirmPassword: string;
  mobileNumber: string;
  securityQuestion: string;
  securityAnswer: string;
  role: 'JOB_SEEKER' | 'EMPLOYER';
  fullName?: string;
  location?: string;
  employmentStatus?: string;
  companyName?: string;
  industry?: string;
  companySize?: string;
  companyDescription?: string;
  website?: string;
  companyLocation?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<UserModel | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private readonly http: HttpClient) {
    const persisted = localStorage.getItem('revhire.currentUser');
    if (persisted) {
      this.currentUserSubject.next(JSON.parse(persisted) as UserModel);
    }
  }

  login(username: string, password: string) {
    return this.http.post<LoginResponse>(`${API_BASE_URL}/login`, { username, password }).pipe(
      tap((response) => {
        const user: UserModel = {
          id: response.userId,
          role: this.normalizeRole(response.role),
          name: response.fullName || response.username || '',
          email: '',
          password,
          phone: '',
          location: '',
          skills: [],
          education: [],
          experience: [],
          certifications: []
        };
        this.updateCurrentUser(user);
      }),
      map(() => true),
      catchError(() => of(false))
    );
  }

  logout(): void {
    this.currentUserSubject.next(null);
    localStorage.removeItem('revhire.currentUser');
  }

  register(payload: RegisterPayload) {
    return this.http.post(`${API_BASE_URL}/register`, payload, { responseType: 'text' }).pipe(
      switchMap(() => this.login(payload.username, payload.password))
    );
  }

  registerSeeker(payload: {
    name: string;
    email?: string;
    password: string;
    phone: string;
  }) {
    return this.register({
      username: payload.name,
      email: payload.email,
      password: payload.password,
      confirmPassword: payload.password,
      mobileNumber: payload.phone,
      securityQuestion: 'Default security question?',
      securityAnswer: 'default',
      role: 'JOB_SEEKER',
      fullName: payload.name,
      employmentStatus: 'Open to work'
    });
  }

  registerEmployer(payload: {
    name: string;
    email?: string;
    password: string;
    phone: string;
    companyName?: string;
    industry?: string;
    companySize?: string;
    companyDescription?: string;
    website?: string;
    companyLocation?: string;
  }) {
    return this.register({
      username: payload.name,
      email: payload.email,
      password: payload.password,
      confirmPassword: payload.password,
      mobileNumber: payload.phone,
      securityQuestion: 'Default security question?',
      securityAnswer: 'default',
      role: 'EMPLOYER',
      companyName: payload.companyName,
      industry: payload.industry,
      companySize: payload.companySize,
      companyDescription: payload.companyDescription,
      website: payload.website,
      companyLocation: payload.companyLocation
    });
  }

  getSecurityQuestion(username: string) {
    return this.http.post(`${API_BASE_URL}/forgot-password`, { username }, { responseType: 'text' });
  }

  resetPassword(username: string, answer: string, newPassword: string) {
    return this.http.post(
      `${API_BASE_URL}/reset-password`,
      { username, answer, newPassword },
      { responseType: 'text' }
    );
  }

  getCurrentUser(): UserModel | null {
    return this.currentUserSubject.value;
  }

  updateCurrentUser(updatedUser: UserModel): void {
    this.currentUserSubject.next(updatedUser);
    localStorage.setItem('revhire.currentUser', JSON.stringify(updatedUser));
  }

  getUserById(userId: number): UserModel | undefined {
    return this.currentUserSubject.value?.id === userId ? this.currentUserSubject.value : undefined;
  }

  isLoggedIn(): boolean {
    return !!this.currentUserSubject.value;
  }

  getRole(): UserRole | null {
    return this.currentUserSubject.value?.role ?? null;
  }

  private normalizeRole(role: string): UserRole {
    return role.toUpperCase().includes('EMPLOYER') ? 'employer' : 'seeker';
  }
}
