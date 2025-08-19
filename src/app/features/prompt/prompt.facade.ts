import {computed, inject, Injectable, Signal, signal, WritableSignal} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {CommandService} from '../../shared/services/command.service';
import {delay, EMPTY, finalize, Observable, tap} from 'rxjs';
import {CreateChatCommand} from '../../shared/models/command.models';

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
  private _hasLineBreaks: WritableSignal<boolean> = signal(false);
  readonly hasLineBreaks: Signal<boolean> = this._hasLineBreaks.asReadonly();
  private _file: WritableSignal<File | null> = signal<File | null>(null);
  readonly filename: Signal<string | null> = computed(() => this._file()?.name ?? null);
  readonly loading: WritableSignal<boolean> = signal(false);
  readonly error: WritableSignal<string | null> = signal<string | null>(null);

  constructor() {
  }

  setHasLineBreaks(value: boolean) {
    this._hasLineBreaks.set(value);
  }

  createChat(): Observable<{ chatId: string }> {
    if (this.loading() || this.form.invalid) return EMPTY;
    this.loading.set(true);
    const text: string = this.form.controls.text.value;
    return this.api.execute(new CreateChatCommand(text))
      .pipe(
        delay(1000),
        finalize(() => this.loading.set(false)),
        tap({error: () => this.error.set('Failed to create chat')})
      );
  }

  reset(): void {
    this.form.reset();
    this._file.set(null);
    this._hasLineBreaks.set(false);
    this.error.set(null);
  }
}
