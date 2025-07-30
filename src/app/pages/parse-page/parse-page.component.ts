import {Component, ElementRef, HostListener, Inject, PLATFORM_ID, ViewChild} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {Router} from '@angular/router';
import {isPlatformBrowser, NgClass} from '@angular/common';

interface ValidationError {
  message: string;
  hint: string;
  type?: 'error' | 'warning';
}

@Component({
  selector: 'app-parse-page',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NgClass
  ],
  templateUrl: './parse-page.component.html',
  styleUrl: './parse-page.component.css'
})
export class ParsePageComponent {
  @ViewChild('linkInput') linkedInInput!: ElementRef;

  url: string = '';
  multipleErrors: ValidationError[] | null = null;
  private urlPattern = /^(https?:\/\/)?(www\.)?linkedin\.com\/in\/[\w-]+\/?$/i;
  private urlProfilePattern = /^(https?:\/\/)?(www\.)?linkedin\.com\/in\/([a-zA-Z0-9_-]+[a-zA-Z0-9_-]*)\/?$/;

  constructor(private router: Router, @Inject(PLATFORM_ID) private platformId: Object) {
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('form')) {
      this.clearInputElements();
    }
  }


  submitLink(): void {
    if (!this.url.trim()) {
      this.expandInput([{
        type: 'error',
        message: 'Please provide your LinkedIn profile page URL.',
        hint: 'Make sure the URL is correct and try again. Example: linkedin.com/in/your-name'
      }]);
      return;
    }

    if (!this.testLink(this.url)) {
      this.expandInput([{
        type: 'error',
        message: 'This is not a LinkedIn profile page URL.',
        hint: 'Make sure the URL is correct and try again. Example: linkedin.com/in/your-name',
      }]);
      return;
    }

    this.clearInputElements();

    const profileId: string | null = this.extractLinkedInProfileFromUrl(this.url);

    if (!profileId) {
      this.expandInput([{
        type: 'error',
        message: 'Can\'t extract a LinkedIn profile ID from the provided URL.',
        hint: 'Make sure the URL is correct and try again. Example: linkedin.com/in/your-name',
      }]);
      return;
    }

    if (isPlatformBrowser(this.platformId)) {
      // this.analyticsService.trackEvent("submit_linkedin_profile_attempt", {"url": this.url});
      this.router.navigate(['/resumes', encodeURIComponent(profileId), "draft"])
        .then(navigated => {
          if (navigated) {
            console.log(`Navigated to /resumes/${profileId}/draft`);
            // this.analyticsService.trackEvent("submit_linkedin_profile_success", {"url": this.url});
          } else {
            console.warn(`Navigation to /resumes/${profileId}/draft was not successful (navigated=false). This might be due to a route guard or other navigation issue.`);
            this.expandInput([{
              type: 'error',
              message: "Could not proceed with the provided URL.",
              hint: 'Make sure the URL is correct and try again. Example: linkedin.com/in/your-name'
            }])
            // this.analyticsService.trackEvent("submit_linkedin_profile_navigation_failed", {
            //   "url": this.url,
            //   "reason": "navigation_returned_false"
            // });
          }
        })
        .catch(err => {
          console.error(`Error navigating to /resumes/${profileId}/draft:`, err);
          this.expandInput([{
            type: 'error',
            message: "An error occurred while processing your request.",
            hint: 'Please try again later.'
          }])
          // this.analyticsService.trackEvent("submit_linkedin_profile_error", {
          //   "url": this.url,
          //   "error": err.message || err
          // });
        });
    }
  }

  expandInput(errors: ValidationError[]): void {
    this.multipleErrors = errors;
  }

  onInputChange(): void {
    if (this.url.trim()) {
      this.clearInputElements();
    }
  }

  clearInputElements(): void {
    this.multipleErrors = null;
  }

  handleClipboardPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pastedText = event.clipboardData?.getData('text/plain') || '';
    let sanitizedText = pastedText
      .replace(/^https?:\/\//i, '').replace(/^www\./i, '');
    const inputElement = this.linkedInInput.nativeElement;
    const start = inputElement.selectionStart || 0, end = inputElement.selectionEnd || 0;
    const currentValue = this.url || '';
    this.url = currentValue.substring(0, start) + sanitizedText + currentValue.substring(end);
  }

  testLink(url: string): boolean {
    return this.urlPattern.test(url);
  }

  extractLinkedInProfileFromUrl(url: string): string | null {
    const match: RegExpMatchArray | null = url.match(this.urlProfilePattern);
    if (match && match[3]) {
      return match[3];
    }
    return null;
  }
}
