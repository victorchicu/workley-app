import {Component, ElementRef, EventEmitter, inject, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule
} from '@angular/forms';
import {AsyncPipe, NgIf} from '@angular/common';
import {PromptForm, ResumePromptService} from '../../services/resume-prompt.service';
import {Subject, takeUntil} from 'rxjs';

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
export class PromptInputComponent implements OnInit, OnDestroy {
  @Input() form!: PromptForm;
  @Input() placeholder: string = "How can I help you today?";
  @Input() deactivated: boolean = false;
  @Output() onKeyDown: EventEmitter<void> = new EventEmitter<void>();
  @ViewChild('textAreaRef') textAreaRef!: ElementRef<HTMLTextAreaElement>;

  promptHasMultipleLines: boolean = false;

  readonly promptService: ResumePromptService = inject(ResumePromptService);

  private destroy$: Subject<void> = new Subject<void>();
  private resumePromptService = inject(ResumePromptService);

  ngOnInit(): void {
    this.promptHasMultipleLines = this.resumePromptService.getPromptHasMultipleLines();
    this.resumePromptService.promptHasMultipleLines$
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => this.promptHasMultipleLines = value);
  }

  ngOnDestroy(): void {
    this.resumePromptService.setPromptHasMultipleLines(this.promptHasMultipleLines);
    this.destroy$.next();
    this.destroy$.complete();
  }

  handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      console.log("On 'Enter' key down: ", this.form);
      event.preventDefault();
      this.onKeyDown.emit();
      return;
    }

    if (this.form.invalid) {
      this.form.markAsDirty();
      this.form.markAllAsTouched();
      return;
    }
  }

  onTextCollideWrapNewLine(): void {
    const textarea: HTMLTextAreaElement = this.textAreaRef.nativeElement;
    const content: string = textarea.value;

    const hasLineBreaks: boolean = content.includes('\n');
    const wouldCollide: boolean = this.wouldTextCollideWithActions(content);

    this.updatePromptHasMultipleLinesState(hasLineBreaks || wouldCollide);

    if (this.promptHasMultipleLines) {
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

  updatePromptHasMultipleLinesState(value: boolean) {
    this.promptHasMultipleLines = value;
    this.resumePromptService.setPromptHasMultipleLines(value);
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

    const styles: CSSStyleDeclaration = window.getComputedStyle(textarea);
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
    const textWidth: number = measureSpan.offsetWidth;
    document.body.removeChild(measureSpan);

    const availableSpace = this.getAvailableSpace();

    // Buffer to trigger before actual collision
    const buffer = 10;

    return textWidth > (availableSpace - buffer);
  }
}
