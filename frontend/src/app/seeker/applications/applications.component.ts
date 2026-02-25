import { Component, OnInit } from '@angular/core';
import { ApplicationModel } from '../../models/application.model';
import { ApplicationService } from '../../services/application.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-applications',
  templateUrl: './applications.component.html',
  styleUrls: ['./applications.component.css']
})
export class ApplicationsComponent implements OnInit {
  applications: ApplicationModel[] = [];

  constructor(
    private readonly authService: AuthService,
    private readonly applicationService: ApplicationService
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
      this.applications = applications;
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
