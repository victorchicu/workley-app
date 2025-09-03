import {Component, ElementRef, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {
  FormGroup,
  FormsModule,
  ReactiveFormsModule
} from '@angular/forms';
import {PromptControl} from '../../prompt.component';

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
  @Input() state!: {
    form: FormGroup<PromptControl>;
    error: string | null;
    isSubmitting: boolean;
    isLineWrapped: boolean
  };
  @Input() placeholder: string = "What job are you applying for?";
  @Input() deactivated: boolean = false;
  @Output() onPressEnter: EventEmitter<void> = new EventEmitter<void>();
  @Output() lineWrapDetected: EventEmitter<boolean> = new EventEmitter<boolean>();
  @ViewChild('promptRef') promptRef!: ElementRef<HTMLTextAreaElement>;

  handlePressEnter(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.onPressEnter.emit();
      return;
    }
    if (this.state?.form.invalid) {
      this.state.form.markAsDirty();
      this.state.form.markAllAsTouched();
      return;
    }
  }

  handleLineWrapChange(): void {
    const textarea: HTMLTextAreaElement = this.promptRef.nativeElement;
    const content: string = textarea.value;
    const wouldCollide: boolean = this.wouldTextCollideWithActionButtons(content);

    this.state.isLineWrapped = content.includes('\n') || wouldCollide;
    this.lineWrapDetected.emit(this.state.isLineWrapped);

    if (this.state.isLineWrapped) {
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
      const actionsElement = form.querySelector('#action-buttons') as HTMLElement;
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

  private wouldTextCollideWithActionButtons(text: string): boolean {
    if (!text.trim())
      return false;

    const textarea: HTMLTextAreaElement = this.promptRef.nativeElement;
    // Create a temporary span to measure the exact text width
    const styles: CSSStyleDeclaration = window.getComputedStyle(textarea);

    const measureSpan: HTMLSpanElement = document.createElement('span');
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

    const buffer = 10;
    const availableSpace: number = this.getAvailableSpace();
    return textWidth > (availableSpace - buffer);
  }
}
