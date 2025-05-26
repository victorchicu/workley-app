import {Component, inject, OnInit} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {NgForOf, NgIf} from '@angular/common';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {catchError, finalize, throwError} from 'rxjs';

interface ResumeDto {
  name: string;
  title: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  summary?: string;
  experience?: {
    role: string;
    company: string;
    duration: string;
    description: string;
  }[];
  education?: {
    degree: string;
    institution: string;
    year: string;
  }[];
  skills?: string[];
}

@Component({
  selector: 'app-linked-in-resume-draft',
  imports: [
    FormsModule,
    NgIf,
    NgForOf
  ],
  templateUrl: './linked-in-resume-profile-draft.component.html',
  styleUrl: './linked-in-resume-profile-draft.component.css'
})
export class LinkedInResumeProfileDraftComponent implements OnInit {
  error: string | null = null;
  isLoading: boolean = false;
  resumeDto: ResumeDto | null = null;
  decodedProfileId: string | null = null;

  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe(params => {
      const profileIdFromRoute: string | null = params.get('profileId');
      if (profileIdFromRoute) {
        this.decodedProfileId = decodeURIComponent(profileIdFromRoute);
        this.fetchResumeByProfileId(this.decodedProfileId);
      } else {
        this.error = 'No profile ID found in route params.';
        console.error('No profile ID found in route params.');
      }
    });
  }

  fetchResumeByProfileId(profileId: string): void {
    if (!profileId || profileId.trim() === '') {
      this.error = 'Malformed profile ID. Please check the URL and try again.';
      this.resumeDto = null;
      this.isLoading = false;
      return;
    }

    // Real API call
    this.http.get<ResumeDto>(`/api/resumes/${encodeURIComponent(profileId)}/draft`)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('API Error:', error);

          // Handle different error scenarios
          if (error.status === 404) {
            this.error = 'Profile not found. Please check the LinkedIn URL and try again.';
          } else if (error.status === 400) {
            this.error = 'Invalid request. Please verify the LinkedIn profile URL format.';
          } else if (error.status === 429) {
            this.error = 'Too many requests. Please wait a moment and try again.';
          } else if (error.status === 500) {
            this.error = 'Server error. Please try again later.';
          } else if (error.status === 0) {
            this.error = 'Network error. Please check your connection and try again.';
          } else {
            this.error = 'Could not fetch or generate resume. Please try again.';
          }

          return throwError(() => error);
        }),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (data: ResumeDto) => {
          this.resumeDto = data;
          this.error = null;
        },
        error: () => {
          // Error already handled in catchError
          this.resumeDto = null;
        }
      });
  }

  retryFetch(): void {
    if (this.decodedProfileId) {
      this.fetchResumeByProfileId(this.decodedProfileId);
    }
  }
}
