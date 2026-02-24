import { Component, OnInit } from '@angular/core';
import { JobModel } from '../../models/job.model';
import { AuthService } from '../../services/auth.service';
import { JobService } from '../../services/job.service';

@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.css']
})
export class FavoritesComponent implements OnInit {
  favoriteJobs: JobModel[] = [];

  constructor(
    private readonly authService: AuthService,
    private readonly jobService: JobService
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    const user = this.authService.getCurrentUser();
    if (!user) {
      return;
    }

    this.jobService.getFavoriteJobs(user.id).subscribe((jobs) => {
      this.favoriteJobs = jobs;
    });
  }

  remove(job: JobModel): void {
    const user = this.authService.getCurrentUser();
    if (!user) {
      return;
    }

    this.jobService.toggleFavorite(user.id, job.id);
    this.load();
  }
}
