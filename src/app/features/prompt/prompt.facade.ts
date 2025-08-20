import {computed, inject, Injectable, Signal, signal, WritableSignal} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {CommandService} from '../../shared/services/command.service';
import {catchError, delay, EMPTY, finalize, map, Observable, tap, throwError} from 'rxjs';
import {ActionCommandResult, CreateChatCommand, CreateChatCommandResult} from '../../shared/models/command.models';

export interface PromptControl {
  text: FormControl<string>;
}

export type PromptForm = FormGroup<PromptControl>;

@Injectable({
  providedIn: 'root'
})
export class PromptFacade {
  private builder: FormBuilder = inject(FormBuilder);
  readonly form: PromptForm = this.builder.nonNullable.group({
    text: ['', [Validators.required, Validators.maxLength(1000)]]
  });
  readonly api: CommandService = inject(CommandService);

  private _error: WritableSignal<string | null> = signal<string | null>(null);
  readonly error: Signal<string | null> = this._error.asReadonly();

  private _file: WritableSignal<File | null> = signal<File | null>(null);
  readonly filename: Signal<string | null> = computed(() => this._file()?.name ?? null);

  readonly submitting: WritableSignal<boolean> = signal(false);

  private _hasLineBreaks: WritableSignal<boolean> = signal(false);
  readonly hasLineBreaks: Signal<boolean> = this._hasLineBreaks.asReadonly();

  constructor() {
  }

  setHasLineBreaks(value: boolean) {
    this._hasLineBreaks.set(value);
  }

  createChat(): Observable<CreateChatCommandResult> {
    if (this.submitting() || this.form.invalid)
      return EMPTY;
    this.submitting.set(true);
    const text: string = this.form.controls.text.value;
    return this.api.execute(new CreateChatCommand(text))
      .pipe(
        delay(1000),
        map((result: ActionCommandResult) => result as CreateChatCommandResult),
        tap((result: CreateChatCommandResult) => {
          if (!result.chatId) {
            throw new Error('NO_CHAT_ID_RETURNED');
          }
        }),
        finalize(() => {
          this.submitting.set(false);
          this.clear();
        }),
        catchError((err) => {
          const message: string = err.message === 'NO_CHAT_ID_RETURNED'
            ? 'Oops! Something went wrong while creating the chat, please try again.'
            : 'Oops! Something went wrong, please try again.';
          return throwError(() => new Error(message));
        })
      );
  }

  private clear(): void {
    this.form.reset();
    this._file.set(null);
    this._error.set(null);
    this._hasLineBreaks.set(false);
  }
}
