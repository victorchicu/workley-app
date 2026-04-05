import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  HostListener,
  inject,
  input,
  output,
  signal,
  ViewChild
} from '@angular/core';
import {
  FormGroup,
  FormsModule,
  ReactiveFormsModule
} from '@angular/forms';
import {PromptControl} from '../../prompt.component';
import {AttachmentCardComponent} from '../attachment-card/attachment-card.component';
import {AttachmentUploadState} from '../../../../shared/chat-api/attachment-api.models';
import {JobApiService} from '../../../../shared/services/job-api.service';
import {debounceTime, distinctUntilChanged, of, Subject, switchMap} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-prompt-input-form',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    AttachmentCardComponent,
  ],
  templateUrl: './prompt-input-form.component.html',
  styleUrl: './prompt-input-form.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PromptInputFormComponent {
  readonly form = input.required<FormGroup<PromptControl>>();
  readonly error = input<string | null>(null);
  readonly placeholder = input("Describe it. We’ll match it.");
  readonly isSubmitting = input<boolean>(false);
  readonly isDeactivated = input(false);
  readonly isLineWrapped = input<boolean>(false);
  readonly autocompleteSource = input<'title' | 'location' | 'work_mode' | null>(null);
  readonly onPressEnter = output<void>()
  readonly lineWrapDetected = output<boolean>()
  readonly attachment = input<AttachmentUploadState | null>(null);
  readonly removeAttachment = output<void>();
  @ViewChild('promptRef') promptRef!: ElementRef<HTMLTextAreaElement>;
  @ViewChild('hintsList') hintsListRef?: ElementRef<HTMLElement>;

  private readonly jobApi = inject(JobApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly elementRef = inject(ElementRef);
  private singleLineWidth = 0;

  protected readonly hints = signal<string[]>([]);
  protected readonly showHints = signal(false);
  protected readonly hintIndex = signal(-1);
  private readonly hintInput$ = new Subject<string>();

  viewModel = computed(() => ({
    form: this.form(),
    error: this.error(),
    placeholder: this.placeholder(),
    isSubmitting: this.isSubmitting(),
    isDeactivated: this.isDeactivated(),
    isLineWrapped: this.isLineWrapped(),
    attachment: this.attachment(),
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
    effect(() => {
      const hasAttachment = this.attachment() !== null;
      if (hasAttachment && !this.isLineWrapped()) {
        this.lineWrapDetected.emit(true);
      }
      if (!hasAttachment && this.isLineWrapped() && this.promptRef) {
        const textarea = this.promptRef.nativeElement;
        const content = textarea.value;
        const lineHeight = parseInt(getComputedStyle(textarea).lineHeight, 10) || 24;
        textarea.style.height = 'auto';
        const needsWrap = content.includes('\n') || textarea.scrollHeight > lineHeight * 1.5;
        textarea.style.height = needsWrap ? `${textarea.scrollHeight}px` : '24px';
        if (!needsWrap) {
          this.lineWrapDetected.emit(false);
        }
      }
    });
    effect(() => {
      if (!this.autocompleteSource()) {
        this.hints.set([]);
        this.showHints.set(false);
      }
    });

    this.hintInput$.pipe(
      debounceTime(80),
      distinctUntilChanged(),
      switchMap(q => {
        const source = this.autocompleteSource();
        if (!source || q.length < 2) return of([]);
        return this.jobApi.getHints(q, source);
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: hints => {
        const currentText = (this.form().controls.text.value ?? '').trim().toLowerCase();
        // Suppress dropdown if the input already exactly matches a hint (user just completed).
        const exactMatch = hints.some(h => h.toLowerCase() === currentText);
        this.hints.set(hints);
        this.showHints.set(hints.length > 0 && !exactMatch);
        this.hintIndex.set(hints.length > 0 && !exactMatch ? 0 : -1);
      },
      error: err => console.error('Hints error:', err)
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

    if (this.showHints() && this.hints().length > 0) {
      const count = this.hints().length;
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        this.hintIndex.update(i => (i + 1) % count);
        this.scrollActiveHintIntoView();
        return;
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        this.hintIndex.update(i => (i <= 0 ? count - 1 : i - 1));
        this.scrollActiveHintIntoView();
        return;
      }
      if ((event.key === 'Enter' || event.key === 'Tab') && this.hintIndex() >= 0) {
        event.preventDefault();
        this.selectHint(this.hints()[this.hintIndex()]);
        return;
      }
      if (event.key === 'Escape') {
        event.preventDefault();
        this.showHints.set(false);
        return;
      }
    }

    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.showHints.set(false);
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

    if (this.autocompleteSource()) {
      this.hintInput$.next(this.form().controls.text.value ?? '');
    }

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

  protected selectHint(hint: string): void {
    this.form().controls.text.setValue(hint);
    this.showHints.set(false);
    this.hints.set([]);
    this.hintIndex.set(-1);
    this.focusInput();
  }

  protected highlightHtml(hint: string): string {
    const query = (this.form().controls.text.value ?? '').trim();
    if (!query) return this.escapeHtml(hint);
    const idx = hint.toLowerCase().indexOf(query.toLowerCase());
    if (idx < 0) return this.escapeHtml(hint);
    const before = this.escapeHtml(hint.substring(0, idx));
    const match = this.escapeHtml(hint.substring(idx, idx + query.length));
    const after = this.escapeHtml(hint.substring(idx + query.length));
    return `${before}<strong class="font-semibold">${match}</strong>${after}`;
  }

  private escapeHtml(s: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };
    return s.replace(/[&<>"']/g, c => map[c]);
  }

  private scrollActiveHintIntoView(): void {
    setTimeout(() => {
      if (!this.hintsListRef) return;
      const active = this.hintsListRef.nativeElement.querySelector('[data-active="true"]') as HTMLElement | null;
      active?.scrollIntoView({ block: 'nearest' });
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.showHints.set(false);
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
