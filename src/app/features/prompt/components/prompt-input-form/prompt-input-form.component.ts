import {Component, computed, ElementRef, EventEmitter, input, Input, output, Output, ViewChild} from '@angular/core';
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
  readonly form = input.required<FormGroup<PromptControl>>();
  readonly error = input<string | null>(null);
  readonly placeholder = input("What job are you applying for?");
  readonly isSubmitting = input<boolean>(false);
  readonly isDeactivated = input(false);
  readonly isLineWrapped = input<boolean>(false);
  readonly onPressEnter = output<void>()
  readonly lineWrapDetected = output<boolean>()
  @ViewChild('promptRef') promptRef!: ElementRef<HTMLTextAreaElement>;

  viewModel = computed(() => ({
    form: this.form(),
    error: this.error(),
    placeholder: this.placeholder(),
    isSubmitting: this.isSubmitting(),
    isDeactivated: this.isDeactivated(),
    isLineWrapped: this.isLineWrapped(),
  }));

  handlePressEnter(event: KeyboardEvent): void {
    const state = this.viewModel();
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.onPressEnter.emit();
      return;
    }
    if (state.form.invalid) {
      state.form.markAsDirty();
      state.form.markAllAsTouched();
      return;
    }
  }

  handleLineWrapChange(): void {
    const state = this.viewModel();

    const textarea: HTMLTextAreaElement = this.promptRef.nativeElement;
    const content: string = textarea.value;
    const wouldCollide: boolean = this.wouldTextCollideWithActionButtons(content);

    state.isLineWrapped = content.includes('\n') || wouldCollide;
    this.lineWrapDetected.emit(state.isLineWrapped);

    if (state.isLineWrapped) {
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
