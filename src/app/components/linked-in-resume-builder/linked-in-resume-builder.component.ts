import {Component, ElementRef, HostListener, ViewChild} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {NgClass, NgForOf, NgIf} from '@angular/common';

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

  submitLinkedInProfile(): void {
    if (!this.url.trim()) {
      this.showSingleError('Please enter a valid LinkedIn profile page');
      return;
    }

    if (!this.isValidLinkedInUrl(this.url)) {
      // Show multiple errors for invalid URL
      this.showMultipleErrors([
        {
          message: 'Invalid LinkedIn profile page',
          hint: 'Profile page format should be: linkedin.com/in/your-name',
          type: 'error'
        },
      ]);
      return;
    }

    // Clear errors and process valid URL
    this.clearErrors();
    // Your submission logic here
    console.log('Valid LinkedIn URL:', this.url);
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
}
