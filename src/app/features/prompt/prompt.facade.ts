import {computed, inject, Injectable, Signal, signal, WritableSignal} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {CommandService} from '../../shared/services/command.service';
import {SpinnerService} from '../../shared/side-effects/spinner.service';
import {delay, finalize, Observable} from 'rxjs';
import {CreateChatCommand} from '../../shared/models/command.models';

export interface PromptControl {
  text: FormControl<string>;
}

export type PromptForm = FormGroup<PromptControl>;

interface Prompt {
  text: string;
}

@Injectable({
  providedIn: 'root'
})
export class PromptFacade {
  private router: Router = inject(Router);
  private promptService: CommandService = inject(CommandService);
  private spinnerService: SpinnerService = inject(SpinnerService);
  readonly loading$: Observable<boolean> = this.spinnerService.loading$;
  private readonly _hasLineBreaks: WritableSignal<boolean> = signal(false);
  readonly hasLineBreaks: Signal<boolean> = this._hasLineBreaks.asReadonly();
  private formBuilder = inject(FormBuilder);
  readonly form: PromptForm = this.formBuilder.group({
    text: new FormControl<string>('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(1000),
      ]
    })
  });
  private readonly _uploadedFile: WritableSignal<File | null> = signal<File | null>(null);
  readonly filename: Signal<string | null> = computed(() => this._uploadedFile()?.name ?? null);

  constructor() {
  }

  setHasMultipleLines(value: boolean) {
    this._hasLineBreaks.set(value);
  }

  async submit(): Promise<void> {
    if (!this.form.valid) {
      return ;
    }

    if (this.spinnerService.loading) {
      return;
    }

    this.spinnerService.setLoading(true);

    const prompt: Prompt = this.form.value as Prompt;
    console.log("Execute create chat command with prompt: ", prompt);

    const file: File | null = this._uploadedFile();
    if (file) {
      console.log("With attached file: ", file.name);
    }

    this.promptService.execute(new CreateChatCommand(prompt.text))
      .pipe(
        delay(1000),
        finalize(() => this.spinnerService.setLoading(false))
      )
      .subscribe({
        next: (result: any) => {
          console.log('Create chat command result:', result);
          if (result.chatId) {
            this.cleanup();
            this.router.navigate(['/chat', result.chatId], {
              state: result
            });
          }
        },
        error: (error) => {
          console.error('Error sending create chat command', error);
          this.router.navigate(['/error']);
        },
      });
  }

  private cleanup(): void {
    this.form.reset();
    this._uploadedFile.set(null);
    this._hasLineBreaks.set(false);
  }
}
