export type Role = 'JOB_SEEKER' | 'EMPLOYER';
export type JobStatus = 'OPEN' | 'CLOSED' | 'FILLED';
export type ApplicationStatus = 'APPLIED' | 'UNDER_REVIEW' | 'SHORTLISTED' | 'REJECTED' | 'WITHDRAWN';
export type EmploymentStatus = 'FRESHER' | 'EXPERIENCE';

export interface RegisterRequest {
  username: string;
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  mobileNumber: string;
  securityQuestion: string;
  securityAnswer: string;
  location: string;
  employmentStatus: EmploymentStatus;
  role: Role;
  companyName?: string;
  industry?: string;
  companySize?: string;
  companyDescription?: string;
  website?: string;
  companyLocation?: string;
}

export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface AuthResponse {
  userId: number;
  username: string;
  email: string;
  role: Role;
}
