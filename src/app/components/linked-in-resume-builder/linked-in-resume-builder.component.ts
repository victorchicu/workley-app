import {Component, ElementRef, HostListener, ViewChild} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {NgClass, NgForOf, NgIf} from '@angular/common';
import {Router} from '@angular/router';
import {AnalyticsService} from '../../analytics/analytics.service';

interface ValidationError {
  message: string;
  hint: string;
  type?: 'error' | 'warning';
}

@Component({
  selector: 'app-linked-in-resume-builder',
  standalone: true,
  imports: [
    FormsModule,
    NgIf,
    NgClass,
    NgForOf
  ],
  templateUrl: './linked-in-resume-builder.component.html',
  styleUrl: './linked-in-resume-builder.component.css'
})
export class LinkedInResumeBuilderComponent {
  @ViewChild('linkedInInput') linkedInInput!: ElementRef;

  url: string = '';
  validationError: string | null = null;
  multipleErrors: ValidationError[] | null = null;
  private linkedInProfileRegex = /^(https?:\/\/)?(www\.)?linkedin\.com\/in\/([a-zA-Z0-9_-]+[a-zA-Z0-9_-]*)\/?$/;

  constructor(private router: Router, private analyticsService: AnalyticsService) {
  }

  isValidLinkedInUrl(url: string): boolean {
    const pattern = /^(https?:\/\/)?(www\.)?linkedin\.com\/in\/[\w-]+\/?$/i;
    return pattern.test(url);
  }

  showSingleError(message: string): void {
    this.validationError = message;
    this.multipleErrors = null;
  }

  showMultipleErrors(errors: ValidationError[]): void {
    this.multipleErrors = errors;
    this.validationError = 'Multiple validation errors';
  }

  clearErrors(): void {
    this.validationError = null;
    this.multipleErrors = null;
  }

  onInputChange(): void {
    // Clear errors when user starts typing
    if (this.url.trim()) {
      this.clearErrors();
    }
  }

  handlePaste(event: ClipboardEvent): void {
    // Your paste handling logic
    const pastedText = event.clipboardData?.getData('text');
    if (pastedText) {
      // Process pasted text if needed
      console.log('Pasted:', pastedText);
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    // Clear errors when clicking outside the form
    const target = event.target as HTMLElement;
    if (!target.closest('form')) {
      this.clearErrors();
    }
  }

  extractLinkedInProfile(url: string): string | null {
    const match: RegExpMatchArray | null = url.match(this.linkedInProfileRegex);
    if (match && match[3]) {
      return match[3];
    }
    return null;
  }

  submitLinkedInProfile(): void {
    if (!this.url.trim()) {
      this.showSingleError('Please provide your LinkedIn profile page URL.');
      return;
    }

    if (!this.isValidLinkedInUrl(this.url)) {
      // Show multiple errors for invalid URL
      this.showMultipleErrors([
        {
          message: 'This is not a LinkedIn profile page URL.',
          hint: 'Here is the LinkedIn profile URL format: linkedin.com/in/your-name',
          type: 'error'
        },
      ]);
      return;
    }

    this.clearErrors();

    console.log('Valid LinkedIn URL:', this.url);

    const profileId: string | null = this.extractLinkedInProfile(this.url);

    if (profileId) {
      this.analyticsService.trackEvent("submit_linkedin_profile_attempt", {"url": this.url});
      this.router.navigate(['/resume-draft', profileId])
        .then(navigated => {
          if (navigated) {
            console.log(`Navigated to /resume-draft with profileId: ${profileId}`);
            this.analyticsService.trackEvent("submit_linkedin_profile_success", {"url": this.url});
          } else {
            console.warn(`Navigation to /resume-draft for ${profileId} was not successful (navigated=false). This might be due to a route guard or other navigation issue.`);
            this.validationError = "Could not proceed with the provided URL. Please ensure it's correct and try again.";
            this.analyticsService.trackEvent("submit_linkedin_profile_navigation_failed", {
              "url": this.url,
              "reason": "navigation_returned_false"
            });
          }
        })
        .catch(err => {
          console.error(`Error navigating to /resume-draft for ${profileId}:`, err);
          this.validationError = 'An error occurred while processing your request. Please try again later.';
          this.analyticsService.trackEvent("submit_linkedin_profile_error", {
            "url": this.url,
            "error": err.message || err
          });
        });
    } else {
      this.validationError = 'Could not identify a profile ID from the URL. Please check the format (e.g., linkedin.com/in/your-name).';
      this.analyticsService.trackEvent("submit_linkedin_profile_invalid_id_extraction", {"url": this.url});
    }
  }
}
