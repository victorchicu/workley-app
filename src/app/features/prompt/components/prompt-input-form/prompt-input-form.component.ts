import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  input,
  output,
  ViewChild
} from '@angular/core';
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
  styleUrl: './prompt-input-form.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PromptInputFormComponent {
  readonly form = input.required<FormGroup<PromptControl>>();
  readonly error = input<string | null>(null);
  readonly placeholder = input("What are you looking for?");
  readonly isSubmitting = input<boolean>(false);
  readonly isDeactivated = input(false);
  readonly isLineWrapped = input<boolean>(false);
  readonly onPressEnter = output<void>()
  readonly lineWrapDetected = output<boolean>()
  @ViewChild('promptRef') promptRef!: ElementRef<HTMLTextAreaElement>;

  private singleLineWidth = 0;

  viewModel = computed(() => ({
    form: this.form(),
    error: this.error(),
    placeholder: this.placeholder(),
    isSubmitting: this.isSubmitting(),
    isDeactivated: this.isDeactivated(),
    isLineWrapped: this.isLineWrapped(),
  }));

  constructor() {
    effect(() => {
      if (!this.isSubmitting() && !this.isDeactivated()) {
        this.focusInput();
      }
    });
    effect(() => {
      const formValue = this.form().value;
      if (!this.isSubmitting() && (!formValue.text || formValue.text === '')) {
        this.resetTextareaHeight();
      }
    });
  }

  focusInput(): void {
    setTimeout(() => {
      if (this.promptRef && this.promptRef.nativeElement) {
        this.promptRef.nativeElement.focus();
      }
    }, 0);
  }

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

    if (state.isSubmitting)
      return;

    const textarea: HTMLTextAreaElement = this.promptRef.nativeElement;
    const content: string = textarea.value;

    const prevHeight = textarea.style.height;
    const prevWidth = textarea.style.width;
    const lineHeight = parseInt(getComputedStyle(textarea).lineHeight, 10) || 24;

    // Save single-line width before wrapping so we can check against it later
    if (!state.isLineWrapped) {
      this.singleLineWidth = textarea.clientWidth;
    }

    // When already wrapped, measure against the saved single-line width
    // to avoid oscillation (multi-line textarea is wider → text fits → unwraps → wraps again)
    if (state.isLineWrapped && this.singleLineWidth > 0) {
      textarea.style.width = `${this.singleLineWidth}px`;
    }
    textarea.style.height = 'auto';
    const wouldCollide = content.includes('\n') || textarea.scrollHeight > lineHeight * 1.5;
    textarea.style.height = prevHeight;
    textarea.style.width = prevWidth;

    const justChanged = wouldCollide !== state.isLineWrapped;
    if (justChanged) {
      this.lineWrapDetected.emit(wouldCollide);
    }

    if (wouldCollide) {
      if (justChanged) {
        // Defer height adjustment until after layout reflows to new multi-line width
        requestAnimationFrame(() => this.adjustTextareaHeight());
      } else {
        this.adjustTextareaHeight();
      }
    } else {
      textarea.style.height = '24px';
      textarea.style.overflowY = 'hidden';
    }
  }

  private adjustTextareaHeight(): void {
    const textarea = this.promptRef.nativeElement;

    // Force reflow to ensure proper height calculation
    textarea.style.height = 'auto';
    textarea.style.minHeight = '24px';

    // Use scrollHeight for accurate height
    const naturalHeight = textarea.scrollHeight;
    const maxHeight = 240;

    if (naturalHeight <= maxHeight) {
      textarea.style.height = `${naturalHeight}px`;
      textarea.style.overflowY = 'hidden';
    } else {
      textarea.style.height = `${maxHeight}px`;
      textarea.style.overflowY = 'auto';
    }
  }

  private resetTextareaHeight(): void {
    if (this.promptRef && this.promptRef.nativeElement) {
      const textarea: HTMLTextAreaElement = this.promptRef.nativeElement;
      textarea.style.height = '24px';
      textarea.style.overflowY = 'hidden';
      this.lineWrapDetected.emit(false);
    }
  }
}
