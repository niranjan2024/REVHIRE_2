export type UserRole = 'seeker' | 'employer';

export interface ResumeSectionModel {
  objective: string;
  education: string[];
  experience: string[];
  skills: string[];
  projects: string[];
  certifications: string[];
}

export interface UserModel {
  id: number;
  role: UserRole;
  name: string;
  email: string;
  password: string;
  phone: string;
  location: string;
  currentEmploymentStatus?: string;
  skills: string[];
  education: string[];
  experience: string[];
  certifications: string[];
  resume?: ResumeSectionModel;
  uploadedResumeName?: string;
  companyId?: number;
}
