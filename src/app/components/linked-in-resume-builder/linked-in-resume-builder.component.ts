import {Component, ElementRef, HostListener, Inject, OnDestroy, OnInit, PLATFORM_ID, ViewChild} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {isPlatformBrowser, NgClass, NgForOf, NgIf} from '@angular/common';
import {Router, RouterLink} from '@angular/router';

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
  multipleErrors: ValidationError[] | null = null;
  private linkedinUrlPattern = /^(https?:\/\/)?(www\.)?linkedin\.com\/in\/[\w-]+\/?$/i;
  private linkedinProfilePattern = /^(https?:\/\/)?(www\.)?linkedin\.com\/in\/([a-zA-Z0-9_-]+[a-zA-Z0-9_-]*)\/?$/;

  constructor(private router: Router, @Inject(PLATFORM_ID) private platformId: Object) {
  }

  showDropdown(errors: ValidationError[]): void {
    this.multipleErrors = errors;
  }

  clearDropdown(): void {
    this.multipleErrors = null;
  }

  onInputChange(): void {
    if (this.url.trim()) {
      this.clearDropdown();
    }
  }

  handlePaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pastedText = event.clipboardData?.getData('text/plain') || '';
    let sanitizedText = pastedText
      .replace(/^https?:\/\//i, '').replace(/^www\./i, '');
    const inputElement = this.linkedInInput.nativeElement;
    const start = inputElement.selectionStart || 0, end = inputElement.selectionEnd || 0;
    const currentValue = this.url || '';
    this.url = currentValue.substring(0, start) + sanitizedText + currentValue.substring(end);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('form')) {
      this.clearDropdown();
    }
  }

  isValidLinkedInUrl(url: string): boolean {
    return this.linkedinUrlPattern.test(url);
  }

  extractLinkedInProfileFromUrl(url: string): string | null {
    const match: RegExpMatchArray | null = url.match(this.linkedinProfilePattern);
    if (match && match[3]) {
      return match[3];
    }
    return null;
  }

  submitLinkedInProfileUrl(): void {
    if (!this.url.trim()) {
      this.showDropdown([{
        type: 'error',
        message: 'Please provide your LinkedIn profile page URL.',
        hint: 'Example: linkedin.com/in/your-name'
      }]);
      return;
    }

    if (!this.isValidLinkedInUrl(this.url)) {
      this.showDropdown([{
        type: 'error',
        message: 'This is not a LinkedIn profile page URL.',
        hint: 'Example: linkedin.com/in/your-name',
      }]);
      return;
    }

    this.clearDropdown();

    console.log('Valid LinkedIn URL:', this.url);

    const profileId: string | null = this.extractLinkedInProfileFromUrl(this.url);

    if (isPlatformBrowser(this.platformId)) {
      if (profileId) {
        // this.analyticsService.trackEvent("submit_linkedin_profile_attempt", {"url": this.url});
        this.router.navigate(['/resume-draft', profileId])
          .then(navigated => {
            if (navigated) {
              console.log(`Navigated to /resume-draft with profileId: ${profileId}`);
              // this.analyticsService.trackEvent("submit_linkedin_profile_success", {"url": this.url});
            } else {
              console.warn(`Navigation to /resume-draft for ${profileId} was not successful (navigated=false). This might be due to a route guard or other navigation issue.`);
              this.showDropdown([{
                type: 'error',
                message: "Could not proceed with the provided URL.",
                hint: 'Please ensure it\'s correct and try again.'
              }])
              // this.analyticsService.trackEvent("submit_linkedin_profile_navigation_failed", {
              //   "url": this.url,
              //   "reason": "navigation_returned_false"
              // });
            }
          })
          .catch(err => {
            console.error(`Error navigating to /resume-draft for ${profileId}:`, err);
            this.showDropdown([{
              type: 'error',
              message: "An error occurred while processing your request.",
              hint: 'Please try again later.'
            }])
            // this.analyticsService.trackEvent("submit_linkedin_profile_error", {
            //   "url": this.url,
            //   "error": err.message || err
            // });
          });
      } else {
        this.showDropdown([{
          type: 'error',
          message: "Could not identify a profile ID from the URL.",
          hint: 'Please check the format (e.g., linkedin.com/in/your-name)'
        }])
        // this.analyticsService.trackEvent("submit_linkedin_profile_invalid_id_extraction", {"url": this.url});
      }
    }
  }
}
