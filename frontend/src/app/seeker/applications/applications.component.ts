import { Component, OnInit } from '@angular/core';
import { ApplicationModel } from '../../models/application.model';
import { JobModel } from '../../models/job.model';
import { ApplicationService } from '../../services/application.service';
import { AuthService } from '../../services/auth.service';
import { JobService } from '../../services/job.service';

@Component({
  selector: 'app-applications',
  templateUrl: './applications.component.html',
  styleUrls: ['./applications.component.css']
})
export class ApplicationsComponent implements OnInit {
  applications: Array<ApplicationModel & { job?: JobModel }> = [];

  constructor(
    private readonly authService: AuthService,
    private readonly applicationService: ApplicationService,
    private readonly jobService: JobService
  ) {}

  ngOnInit(): void {
    this.loadApplications();
  }

  loadApplications(): void {
    const user = this.authService.getCurrentUser();
    if (!user) {
      return;
    }

    this.applicationService.getBySeeker(user.id).subscribe((applications) => {
      this.jobService.getAllJobs().subscribe((jobs) => {
        this.applications = applications.map((application) => ({
          ...application,
          job: jobs.find((job) => job.id === application.jobId)
        }));
      });
    });
  }

  withdraw(applicationId: number): void {
    const user = this.authService.getCurrentUser();
    if (!user) {
      return;
    }

    const confirmed = window.confirm('Withdraw this application?');
    if (!confirmed) {
      return;
    }

    const reason = window.prompt('Optional withdrawal reason:') ?? undefined;
    this.applicationService.withdraw(applicationId, user.id, reason).subscribe(() => {
      this.loadApplications();
    });
  }
}
