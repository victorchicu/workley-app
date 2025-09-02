import {inject, Injectable, Signal, signal, WritableSignal} from '@angular/core';
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
export class PromptState {
  readonly formBuilder: FormBuilder = inject(FormBuilder);
  readonly form: PromptForm = this.formBuilder.nonNullable.group({text: ['', [Validators.required, Validators.maxLength(2000)]]});
  readonly commandService: CommandService = inject(CommandService);

  private _error: WritableSignal<string | null> = signal<string | null>(null);
  private _lineWrapDetected: WritableSignal<boolean> = signal(false);

  readonly error: Signal<string | null> = this._error.asReadonly();
  readonly isSubmitting: WritableSignal<boolean> = signal(false);
  readonly lineWrapDetected: Signal<boolean> = this._lineWrapDetected.asReadonly();

  createChat(): Observable<CreateChatCommandResult> {
    if (this.form.invalid || this.isSubmitting())
      return EMPTY;
    this.isSubmitting.set(true);
    const text: string = this.form.controls.text.value;
    return this.commandService.execute(new CreateChatCommand(text))
      .pipe(
        delay(500),
        map((result: ActionCommandResult) => result as CreateChatCommandResult),
        tap((result: CreateChatCommandResult) => {
          if (!result.chatId) {
            throw new Error();
          }
        }),
        finalize(() => {
          this.form.reset();
          this._error.set(null);
          this.isSubmitting.set(false);
          this._lineWrapDetected.set(false);
        }),
        catchError((err) => {
          this._error.set("Oops! Something went wrong, please try again.");
          return throwError(() => new Error("Chat creation failed"));
        })
      );
  }

  setLineWrapped(value: boolean) {
    this._lineWrapDetected.set(value);
  }
}
