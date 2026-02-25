export type ApplicationStatus =
  | 'Applied'
  | 'Under Review'
  | 'Shortlisted'
  | 'Rejected'
  | 'Withdrawn';

export interface ApplicationModel {
  id: number;
  jobId: number;
  seekerId: number;
  seekerName: string;
  seekerSkills: string[];
  seekerExperience: string[];
  coverLetter?: string;
  status: ApplicationStatus;
  appliedAt: string;
  comments?: string;
  note?: string;
  withdrawReason?: string;
}
