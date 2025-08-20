import {Component, computed, ElementRef, EventEmitter, inject, Input, Output, Signal, ViewChild} from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule
} from '@angular/forms';
import {PromptFacade} from '../../prompt.facade';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './input.component.html',
  styleUrl: './input.component.css'
})
export class InputComponent {
  @Input() placeholder: string = "How can I help you today?";
  @Input() deactivated: boolean = false;
  @Output() onKeyDown: EventEmitter<void> = new EventEmitter<void>();
  @ViewChild('promptRef') promptRef!: ElementRef<HTMLTextAreaElement>;

  private readonly facade: PromptFacade = inject(PromptFacade);

  viewModel = computed(() => ({
    form: this.facade.form,
    error: this.facade.error(),
    submitting: this.facade.submitting(),
    hasLineBreaks: this.facade.hasLineBreaks(),
  }));

  handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      console.log("On 'Enter' key down: ", this.facade.form);
      event.preventDefault();
      this.onKeyDown.emit();
      return;
    }

    if (this.facade.form.invalid) {
      this.facade.form.markAsDirty();
      this.facade.form.markAllAsTouched();
      return;
    }
  }

  onTextCollideWrapNewLine(): void {
    const textarea: HTMLTextAreaElement = this.promptRef.nativeElement;
    const content: string = textarea.value;

    const hasLineBreaks: boolean = content.includes('\n');
    const wouldCollide: boolean = this.wouldTextCollideWithActions(content);

    this.facade.setHasLineBreaks(hasLineBreaks || wouldCollide);

    if (this.facade.hasLineBreaks()) {
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
