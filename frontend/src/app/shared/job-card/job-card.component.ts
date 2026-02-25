import { Component, EventEmitter, Input, Output } from '@angular/core';
import { JobModel } from '../../models/job.model';

@Component({
  selector: 'app-job-card',
  templateUrl: './job-card.component.html',
  styleUrls: ['./job-card.component.css']
})
export class JobCardComponent {
  @Input() job!: JobModel;
  @Input() isFavorite = false;
  @Input() canApply = true;

  @Output() apply = new EventEmitter<JobModel>();
  @Output() favorite = new EventEmitter<JobModel>();
}
