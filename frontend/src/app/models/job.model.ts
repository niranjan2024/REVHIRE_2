export type JobStatus = 'active' | 'closed' | 'filled';

export interface JobModel {
  id: number;
  employerId: number;
  companyName: string;
  title: string;
  description: string;
  skills: string[];
  experienceYears: number;
  education: string;
  location: string;
  salaryMin: number;
  salaryMax: number;
  jobType: 'full-time' | 'part-time' | 'contract' | 'internship' | 'remote';
  deadline: string;
  openings: number;
  datePosted: string;
  status: JobStatus;
}
