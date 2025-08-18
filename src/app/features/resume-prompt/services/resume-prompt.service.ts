import {computed, inject, Injectable, Signal, signal, WritableSignal} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {CommandService} from '../../../shared/services/command.service';
import {SpinnerService} from '../../../shared/services/spinner.service';
import {BehaviorSubject, delay, finalize, Observable} from 'rxjs';
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
  readonly loading$: Observable<boolean> = this.loaderService.loading$;
  private commandService: CommandService = inject(CommandService);
  private promptHasMultipleLinesSubject = new BehaviorSubject<boolean>(false);
  promptHasMultipleLines$: Observable<boolean> = this.promptHasMultipleLinesSubject.asObservable();

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

  uploadFile(file: File): void {
    this._uploadedFile.set(file);
    console.log('File uploaded:', file);
  }

  removeFile(): void {
    this._uploadedFile.set(null);
  }

  setPromptHasMultipleLines(value: boolean) {
    this.promptHasMultipleLinesSubject.next(value);
  }

  getPromptHasMultipleLines(): boolean {
    return this.promptHasMultipleLinesSubject.value;
  }

  async submitPrompt(): Promise<void> {
    if (this.loaderService.loading || !this.form.valid) {
      return;
    }

    this.loaderService.setLoading(true);

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
          this.router.navigate(['/error']);
        }
      });
  }

  private cleanup(): void {
    this.form.reset();
    this._uploadedFile.set(null);
  }
}
