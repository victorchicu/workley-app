import {
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

    if (content.includes('\n')) {
      if (!state.isLineWrapped) {
        this.lineWrapDetected.emit(true);
      }
      this.adjustTextareaHeight();
      return;
    }

    const CHAR_THRESHOLD = 35;
    const wouldCollide = content.length > CHAR_THRESHOLD;

    if (wouldCollide !== state.isLineWrapped) {
      this.lineWrapDetected.emit(wouldCollide);
    }

    if (wouldCollide) {
      this.adjustTextareaHeight();
    } else {
      textarea.style.height = '24px';
      textarea.style.overflowY = 'hidden';
    }
  }

  private adjustTextareaHeight(): void {
    const textarea = this.promptRef.nativeElement;
    textarea.style.height = 'auto';
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
