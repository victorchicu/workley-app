import {DestroyRef, inject, Injectable, Signal, signal, WritableSignal} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {CommandService} from '../../shared/services/command.service';
import {catchError, delay, EMPTY, finalize, map, Observable, tap, throwError} from 'rxjs';
import {ActionCommandResult, CreateChatCommand, CreateChatCommandResult} from '../../shared/models/command.models';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

export interface PromptControl {
  text: FormControl<string>;
}

export type PromptForm = FormGroup<PromptControl>;

@Injectable({
  providedIn: 'root'
})
export class PromptState {
  readonly builder: FormBuilder = inject(FormBuilder);
  readonly command: CommandService = inject(CommandService);
  readonly destroyRef: DestroyRef = inject(DestroyRef);

  readonly form: PromptForm = this.builder.nonNullable.group({
    text: ['', [Validators.required, Validators.maxLength(2000)]]
  });

  private _error: WritableSignal<string | null> = signal<string | null>(null);
  private _hasLineBreaks: WritableSignal<boolean> = signal(false);

  readonly error: Signal<string | null> = this._error.asReadonly();
  readonly isSubmitting: WritableSignal<boolean> = signal(false);
  readonly lineBreakDetected: Signal<boolean> = this._hasLineBreaks.asReadonly();

  createChat(): Observable<CreateChatCommandResult> {
    if (this.isSubmitting() || this.form.invalid)
      return EMPTY;
    this.isSubmitting.set(true);
    const text: string = this.form.controls.text.value;
    return this.command.execute(new CreateChatCommand(text))
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        delay(500),
        map((result: ActionCommandResult) => result as CreateChatCommandResult),
        tap((result: CreateChatCommandResult) => {
          if (!result.chatId) {
            throw new Error('NO_CHAT_ID_RETURNED');
          }
        }),
        finalize(() => {
          this.isSubmitting.set(false);
          this.clear();
        }),
        catchError((err) => {
          const message: string =
            err.message === 'NO_CHAT_ID_RETURNED'
              ? 'Oops! Something went wrong while creating the chat, please try again.'
              : 'Oops! Something went wrong, please try again.';
          return throwError(() => new Error(message));
        })
      );
  }

  setHasLineBreaks(value: boolean) {
    this._hasLineBreaks.set(value);
  }

  private clear(): void {
    this.form.reset();
    this._error.set(null);
    this._hasLineBreaks.set(false);
  }
}
