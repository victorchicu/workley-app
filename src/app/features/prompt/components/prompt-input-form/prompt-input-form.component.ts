import {Component, computed, ElementRef, EventEmitter, inject, Input, Output, Signal, ViewChild} from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule
} from '@angular/forms';
import {PromptState} from '../../../../shared/services/prompt-state.service';

@Component({
  selector: 'app-prompt-input-form',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './prompt-input-form.component.html',
  styleUrl: './prompt-input-form.component.css'
})
export class PromptInputFormComponent {
  @Input() placeholder: string = "What job are you applying for?";
  @Input() deactivated: boolean = false;
  @Output() onPressEnter: EventEmitter<void> = new EventEmitter<void>();
  @ViewChild('promptRef') promptRef!: ElementRef<HTMLTextAreaElement>;

  private readonly prompt: PromptState = inject(PromptState);

  viewModel = computed(() => ({
    form: this.prompt.form,
    error: this.prompt.error(),
    isSubmitting: this.prompt.isSubmitting(),
    isLinedWrapped: this.prompt.lineWrapDetected(),
  }));

  handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      console.log("On 'Enter' key down: ", this.prompt.form);
      event.preventDefault();
      this.onPressEnter.emit();
      return;
    }

    if (this.prompt.form.invalid) {
      this.prompt.form.markAsDirty();
      this.prompt.form.markAllAsTouched();
      return;
    }
  }

  onLineWrapDetected(): void {
    const textarea: HTMLTextAreaElement = this.promptRef.nativeElement;
    const content: string = textarea.value;

    const hasNewLine: boolean = content.includes('\n');
    const wouldCollide: boolean = this.wouldTextCollideWithActions(content);

    this.prompt.setLineWrapped(hasNewLine || wouldCollide);

    if (this.prompt.lineWrapDetected()) {
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
    const textarea: HTMLTextAreaElement = this.promptRef.nativeElement;

    // Try to find the form and measure actual layout
    const form: HTMLFormElement | null = textarea.closest('form');
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

    const textarea: HTMLTextAreaElement = this.promptRef.nativeElement;

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
