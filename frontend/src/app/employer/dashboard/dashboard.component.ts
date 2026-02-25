import { Component, OnInit } from '@angular/core';
import { ApplicationService } from '../../services/application.service';
import { AuthService } from '../../services/auth.service';
import { JobService } from '../../services/job.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  employerName = '';
  totalJobs = 0;
  activeJobs = 0;
  totalApplications = 0;
  pendingReviews = 0;

  constructor(
    private readonly authService: AuthService,
    private readonly jobService: JobService,
    private readonly applicationService: ApplicationService
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (!user) {
      return;
    }
    this.employerName = user.name?.trim() || 'Employer';

    this.jobService.getJobsByEmployer(user.id).subscribe((jobs) => {
      this.applicationService.getByJobIds(jobs.map((job) => job.id)).subscribe((applications) => {
        this.totalJobs = jobs.length;
        this.activeJobs = jobs.filter((job) => job.status === 'active').length;
        this.totalApplications = applications.length;
        this.pendingReviews = applications.filter(
          (application) => application.status === 'Applied' || application.status === 'Under Review'
        ).length;
      });
    });
  }
}
