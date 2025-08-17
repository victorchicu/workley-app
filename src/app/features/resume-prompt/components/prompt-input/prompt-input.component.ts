import {Component, ElementRef, EventEmitter, inject, Input, Output, ViewChild, HostListener} from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule, Validators
} from '@angular/forms';
import {AsyncPipe, NgIf} from '@angular/common';
import {PromptForm, ResumePromptService} from '../../services/resume-prompt.service';

@Component({
  selector: 'app-prompt-input',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    AsyncPipe,
  ],
  templateUrl: './prompt-input.component.html',
  styleUrl: './prompt-input.component.css'
})
export class PromptInputComponent {
  @Input() form!: PromptForm;
  @Input() placeholder: string = "How can I help you today?";
  @Input() deactivated: boolean = false;
  @Output() onKeyDown: EventEmitter<void> = new EventEmitter<void>();
  @ViewChild('textAreaRef') textAreaRef!: ElementRef<HTMLTextAreaElement>;

  hasMultipleLines = false;

  readonly promptService: ResumePromptService = inject(ResumePromptService);

  async handleKeyDown(event: KeyboardEvent) {
    if (this.form.invalid) {
      this.form.markAsDirty();
      this.form.markAllAsTouched();
      return;
    }

    if (event.key === 'Enter' && !event.shiftKey) {
      console.log("On 'Enter' key down: ", this.form);
      event.preventDefault();
      this.onKeyDown.emit();
      return;
    }
  }

  checkTextareaHeight(): void {
    const textarea: HTMLTextAreaElement = this.textAreaRef.nativeElement;
    const content = textarea.value;

    const hasLineBreaks = content.includes('\n');
    const wouldCollide = this.wouldTextCollideWithActions(content);

    this.hasMultipleLines = hasLineBreaks || wouldCollide;

    if (this.hasMultipleLines) {
      textarea.style.height = 'auto';
      const naturalHeight = textarea.scrollHeight;
      const maxHeight = 120;

      if (naturalHeight <= maxHeight) {
        textarea.style.height = `${naturalHeight}px`;
        textarea.style.overflowY = 'hidden';
      } else {
        textarea.style.height = `${maxHeight}px`;
        textarea.style.overflowY = 'auto';
      }
    } else {
      textarea.style.height = '24px';
      textarea.style.overflowY = 'hidden';
    }
  }

  private getAvailableSpace(): number {
    const textarea: HTMLTextAreaElement = this.textAreaRef.nativeElement;

    // Try to find the form and measure actual layout
    const form = textarea.closest('form');
    if (form) {
      const formWidth = form.offsetWidth;
      const formPadding = 32; // px-4 * 2

      // Try to find the actions element
      const actionsElement = form.querySelector('app-prompt-actions') as HTMLElement;
      if (actionsElement) {
        const actionsWidth = actionsElement.offsetWidth;
        const separatorWidth = 20;
        return formWidth - formPadding - actionsWidth - separatorWidth;
      }
    }

    // Fallback - use textarea width and estimate
    const textareaContainerWidth = textarea.parentElement?.offsetWidth || textarea.offsetWidth;
    return textareaContainerWidth * 0.65;
  }

  private wouldTextCollideWithActions(text: string): boolean {
    if (!text.trim()) return false;

    const textarea: HTMLTextAreaElement = this.textAreaRef.nativeElement;

    // Create a temporary span to measure the exact text width
    const measureSpan: HTMLSpanElement = document.createElement('span');

    // Copy the exact font styles from textarea
    const styles = window.getComputedStyle(textarea);
    measureSpan.style.font = styles.font;
    measureSpan.style.fontSize = styles.fontSize;
    measureSpan.style.fontFamily = styles.fontFamily;
    measureSpan.style.fontWeight = styles.fontWeight;
    measureSpan.style.letterSpacing = styles.letterSpacing;
    measureSpan.style.visibility = 'hidden';
    measureSpan.style.position = 'absolute';
    measureSpan.style.whiteSpace = 'nowrap';
    measureSpan.textContent = text;

    document.body.appendChild(measureSpan);
    const textWidth = measureSpan.offsetWidth;
    document.body.removeChild(measureSpan);

    const availableSpace = this.getAvailableSpace();

    // Add a small buffer to trigger before actual collision
    const buffer = 10;

    return textWidth > (availableSpace - buffer);
  }
}
