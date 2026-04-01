import {ChangeDetectionStrategy, ChangeDetectorRef, Component, computed, DestroyRef, inject, signal} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {PromptHeadlineComponent} from './components/prompt-headline/prompt-headline.component';
import {PromptInputFormComponent} from './components/prompt-input-form/prompt-input-form.component';
import {
  PromptSendButtonComponent
} from './components/prompt-send-button/prompt-send-button.component';
import {PromptActionsMenuComponent} from './components/prompt-actions-menu/prompt-actions-menu.component';
import {Router, RouterLink} from '@angular/router';
import {ChatApiService} from '../../shared/chat-api/chat-api.service';
import {CreateChatResponse} from '../../shared/chat-api/chat-api.models';
import {takeUntilDestroyed, toObservable} from '@angular/core/rxjs-interop';
import {catchError, EMPTY, finalize, Observable, tap, throwError} from 'rxjs';
import {AttachmentApiService} from '../../shared/chat-api/attachment-api.service';
import {AttachmentUploadState} from '../../shared/chat-api/attachment-api.models';

export interface PromptControl {
  text: FormControl<string>;
}

export type PromptForm = FormGroup<PromptControl>;

@Component({
  selector: 'app-prompt',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    PromptHeadlineComponent,
    PromptInputFormComponent,
    PromptSendButtonComponent,
    PromptActionsMenuComponent,
    RouterLink
  ],
  templateUrl: './prompt.component.html',
  styleUrl: './prompt.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PromptComponent {
  readonly router: Router = inject(Router);
  readonly builder: FormBuilder = inject(FormBuilder);
  readonly chatApi: ChatApiService = inject(ChatApiService);
  readonly destroyRef: DestroyRef = inject(DestroyRef);
  readonly attachmentApi: AttachmentApiService = inject(AttachmentApiService);

  private readonly form = signal<PromptForm>(
    this.builder.nonNullable.group({
      text: ['', [Validators.required, Validators.maxLength(2000)]]
    })
  );
  private readonly error = signal<string | null>(null);
  private readonly isSubmitting = signal(false);
  private readonly isLineWrapped = signal(false);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly attachment = signal<AttachmentUploadState | null>(null);
  readonly hasAttachment = computed(() => !!this.attachment()?.attachmentId);

  private readonly attachmentSub = toObservable(this.hasAttachment)
    .pipe(takeUntilDestroyed())
    .subscribe(() => this.cdr.markForCheck());

  viewModel = computed(() => ({
    form: this.form(),
    error: this.error(),
    isSubmitting: this.isSubmitting(),
    isLineWrapped: this.isLineWrapped(),
    attachment: this.attachment(),
  }));

  onFileSelected(file: File): void {
    this.attachment.set({
      status: 'uploading',
      progress: 0,
      attachmentId: null,
      filename: file.name,
      mimeType: file.type,
      fileSize: file.size,
      errorMessage: null,
    });

    this.attachmentApi.upload(file)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (state) => this.attachment.set(state),
        error: (err) => this.attachment.set({
          ...this.attachment()!,
          status: 'error',
          errorMessage: err?.error?.message ?? 'Upload failed',
        }),
      });
  }

  onRemoveAttachment(): void {
    const att = this.attachment();
    if (att?.attachmentId) {
      this.attachmentApi.delete(att.attachmentId)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe();
    }
    this.attachment.set(null);
  }

  sendPrompt() {
    this.createChat()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: CreateChatResponse) => {
          this.router.navigate(['/chat', response.chatId], {state: response})
            .then(success => {
              if (!success) {
                this.error.set('Navigation failed');
              }
            })
            .catch(err => {
              console.error('Navigation error:', err);
              this.error.set('Navigation failed');
            });
        },
        error: (cause) => {
          this.router.navigate(['/error'])
            .then(success => {
              if (!success) {
                this.error.set('Navigation failed');
              }
            })
            .catch(err => {
              console.error('Navigation error:', err);
              this.error.set('Navigation failed');
            });
        }
      });
  }

  createChat(): Observable<CreateChatResponse> {
    const state = this.viewModel();
    const hasAttachment = !!this.attachment()?.attachmentId;
    if ((state.form.invalid && !hasAttachment) || state.isSubmitting)
      return EMPTY;
    this.isSubmitting.set(true);
    const text: string = state.form.controls.text.value || '';
    const attachmentId = this.attachment()?.attachmentId ?? undefined;
    return this.chatApi.createChat(text, attachmentId)
      .pipe(
        tap(() => {
          this.error.set(null);
        }),
        finalize(() => {
          this.form().reset();
          this.isSubmitting.set(false);
          this.isLineWrapped.set(false);
          this.attachment.set(null);
        }),
        catchError((err) => {
          this.error.set("Oops! Something went wrong, please try again.");
          return throwError(() => new Error("Chat creation failed"));
        })
      );
  }

  handleLineWrapChange(isWrapped: boolean): void {
    this.isLineWrapped.set(isWrapped);
  }
}
