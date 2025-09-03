import {Component, computed, DestroyRef, inject, signal} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {PromptHeadlineComponent} from './components/prompt-headline/prompt-headline.component';
import {PromptInputFormComponent} from './components/prompt-input-form/prompt-input-form.component';
import {
  PromptSendButtonComponent
} from './components/prompt-send-button/prompt-send-button.component';
import {PromptFileUploadComponent} from './components/prompt-file-upload/prompt-file-upload.component';
import {Router} from '@angular/router';
import {ActionCommandResult, CreateChatCommand, CreateChatCommandResult} from '../../shared/models/command.models';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {catchError, delay, EMPTY, finalize, map, Observable, tap, throwError} from 'rxjs';
import {CommandService} from '../../shared/services/command.service';

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
    PromptFileUploadComponent
  ],
  templateUrl: './prompt.component.html',
  styleUrl: './prompt.component.css',
})
export class PromptComponent {
  readonly router: Router = inject(Router);
  readonly builder: FormBuilder = inject(FormBuilder);
  readonly command: CommandService = inject(CommandService);
  readonly destroyRef: DestroyRef = inject(DestroyRef);

  private readonly form = signal<PromptForm>(
    this.builder.nonNullable.group({
      text: ['', [Validators.required, Validators.maxLength(2000)]]
    })
  );
  private readonly error = signal<string | null>(null);
  private readonly isSubmitting = signal(false);
  private readonly isLineWrapped = signal(false);

  viewModel = computed(() => ({
    form: this.form(),
    error: this.error(),
    isSubmitting: this.isSubmitting(),
    isLineWrapped: this.isLineWrapped()
  }));

  sendPrompt() {
    this.createChat()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: CreateChatCommandResult) => {
          this.router.navigate(['/chat', response.chatId], {state: response})
            .then();
        },
        error: (cause) => {
          this.router.navigate(['/error'])
            .then();
        }
      });
  }

  createChat(): Observable<CreateChatCommandResult> {
    const state = this.viewModel();
    if (state.form.invalid || state.isSubmitting)
      return EMPTY;
    this.isSubmitting.set(true);
    const text: string = state.form.controls.text.value;
    return this.command.execute(new CreateChatCommand(text))
      .pipe(
        delay(500),
        map((actionCommandResult: ActionCommandResult) => actionCommandResult as CreateChatCommandResult),
        tap((createChatCommandResult: CreateChatCommandResult) => {
          this.error.set(null);
          console.log(`CreateChatCommandResult: ${createChatCommandResult}`)
        }),
        finalize(() => {
          this.form().reset();
          this.isSubmitting.set(false);
          this.isLineWrapped.set(false);
        }),
        catchError((err) => {
          this.error.set("Oops! Something went wrong, please try again.");
          console.error(`Chat creation failed: ${err}`)
          return throwError(() => new Error("Chat creation failed"));
        })
      );
  }

  handleLineWrapChange(isWrapped: boolean): void {
    this.isLineWrapped.set(isWrapped);
  }
}
