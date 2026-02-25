import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  AuthResponse,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest
} from '../models/auth.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly baseUrl = '/api';

  constructor(private readonly http: HttpClient) {}

  register(request: RegisterRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/register`, request, { withCredentials: true });
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, request, { withCredentials: true });
  }

  logout(): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/logout`, {}, { withCredentials: true });
  }

  forgotPassword(request: ForgotPasswordRequest): Observable<{ message: string; resetToken: string }> {
    return this.http.post<{ message: string; resetToken: string }>(`${this.baseUrl}/forgot-password`, request, { withCredentials: true });
  }

  resetPassword(request: ResetPasswordRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/reset-password`, request, { withCredentials: true });
  }

  changePassword(request: ChangePasswordRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/change-password`, request, { withCredentials: true });
  }

  updateProfileCompletion(userId: number, profileCompleted: boolean): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/auth/profile-completion/${userId}`, { profileCompleted }, { withCredentials: true });
  }
}
