import {Component, inject, OnInit, signal} from '@angular/core';
import {Router} from '@angular/router';
import {DatePipe} from '@angular/common';
import {JobApiService} from '../../shared/services/job-api.service';
import {JobResponse} from '../../shared/services/job-api.models';

@Component({
  selector: 'app-my-jobs',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './my-jobs.component.html',
})
export class MyJobsComponent implements OnInit {
  private readonly jobApi = inject(JobApiService);
  private readonly router = inject(Router);

  protected readonly jobs = signal<JobResponse[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly expandedJobId = signal<string | null>(null);

  ngOnInit(): void {
    this.jobApi.getJobs().subscribe({
      next: (jobs) => {
        this.jobs.set(jobs);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  toggleExpand(jobId: string): void {
    this.expandedJobId.update(current => current === jobId ? null : jobId);
  }

  navigateToPostJob(): void {
    this.router.navigate(['/']);
  }
}
