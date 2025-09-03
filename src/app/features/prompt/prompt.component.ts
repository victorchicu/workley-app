import {Component, computed, DestroyRef, inject} from '@angular/core';
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
  readonly builder: FormBuilder = inject(FormBuilder);
  private readonly _form: PromptForm = this.builder.nonNullable.group({text: ['', [Validators.required, Validators.maxLength(2000)]]});

  readonly router: Router = inject(Router);
  readonly command: CommandService = inject(CommandService);
  readonly destroyRef: DestroyRef = inject(DestroyRef);

  private _error: string | null = null;
  private _isSubmitting: boolean = false;
  private _isLineWrapped: boolean = false;

  viewModel = computed(() => ({
    form: this._form,
    error: this._error,
    isSubmitting: this._isSubmitting,
    isLineWrapped: this._isLineWrapped
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
    if (this._form.invalid || this._isSubmitting)
      return EMPTY;
    this._isSubmitting = true;
    const text: string = this._form.controls.text.value;
    return this.command.execute(new CreateChatCommand(text))
      .pipe(
        delay(500),
        map((actionCommandResult: ActionCommandResult) => actionCommandResult as CreateChatCommandResult),
        tap((createChatCommandResult: CreateChatCommandResult) => {
          this._error = null;
          console.log(`CreateChatCommandResult: ${createChatCommandResult}`)
        }),
        finalize(() => {
          this._form.reset();
          this._error = null;
          this._isSubmitting = false;
          this._isLineWrapped = false;
        }),
        catchError((err) => {
          this._error = "Oops! Something went wrong, please try again.";
          console.error(`Chat creation failed: ${err}`)
          return throwError(() => new Error("Chat creation failed"));
        })
      );
  }

  handleLineWrapChange(isWrapped: boolean): void {
    console.log(`Handle line wrap change:
      Is wrapped: ${isWrapped}`)
    this._isLineWrapped = isWrapped;
  }
}
