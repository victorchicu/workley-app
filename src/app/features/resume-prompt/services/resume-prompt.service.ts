import {computed, inject, Injectable, Signal, signal, WritableSignal} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {CommandService} from '../../../shared/services/command.service';
import {SpinnerService} from '../../../shared/services/spinner.service';
import {delay, finalize, Observable} from 'rxjs';
import {CreateChatCommand} from '../../../shared/models/api.objects';

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
export class ResumePromptService {
  private router = inject(Router);
  private loaderService: SpinnerService = inject(SpinnerService);
  private commandService: CommandService = inject(CommandService);

  readonly loading$: Observable<boolean> = this.loaderService.loading$;

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
  private readonly _error: WritableSignal<string | null> = signal<string | null>(null);
  readonly error: Signal<string | null> = this._error.asReadonly();
  private readonly _uploadedFile: WritableSignal<File | null> = signal<File | null>(null);
  readonly fileName: Signal<string | null> = computed(() => this._uploadedFile()?.name ?? null);
  readonly uploadedFile: Signal<File | null> = this._uploadedFile.asReadonly();

  constructor() {
  }

  uploadFile(file: File): void {
    this._uploadedFile.set(file);
    console.log('File uploaded:', file);
  }

  removeFile(): void {
    this._uploadedFile.set(null);
  }

  async submitPrompt(): Promise<void> {
    if (this.loaderService.loading || !this.form.valid) {
      return;
    }

    this.loaderService.setLoading(true);
    this._error.set(null);

    const prompt: Prompt = this.form.value as Prompt;
    const file = this._uploadedFile();

    console.log("Sending create chat command with prompt: ", prompt);
    if (file) {
      console.log("With attached file: ", file.name);
    }

    this.commandService.execute(new CreateChatCommand(prompt.text))
      .pipe(
        delay(5000),
        finalize(() => this.loaderService.setLoading(false))
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
          this._error.set('Failed to create resume. Please try again.');
          this.router.navigate(['/error']);
        }
      });
  }

  private cleanup(): void {
    this.form.reset();
    this._error.set(null);
    this._uploadedFile.set(null);
  }
}
