import {Component} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {UploadButtonComponent} from './upload-button/upload-button.component';
import {CreateButtonComponent} from './create-button/create-button.component';
import {PromptService} from '../../services/prompt.service';
import {delay, map, Observable, shareReplay, startWith} from 'rxjs';
import {AsyncPipe} from '@angular/common';

export interface PromptControl {
  text: FormControl<string | null>;
}

export type PromptFormGroup = FormGroup<PromptControl>;

export interface Prompt {
  text: string
}

@Component({
  selector: 'app-input-text',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    UploadButtonComponent,
    CreateButtonComponent,
    AsyncPipe
  ],
  templateUrl: './input-text.component.html',
  styleUrl: './input-text.component.css'
})
export class InputTextComponent {

  isLoading: boolean = false;
  hasPrompt$: Observable<boolean>;
  promptForm: PromptFormGroup;

  constructor(private readonly formBuilder: FormBuilder, private readonly resumeService: PromptService) {
    this.promptForm = this.formBuilder.nonNullable.group({
      text: new FormControl<string>('', {
        validators: [Validators.required,
          Validators.minLength(1),
          Validators.maxLength(1000),
        ]
      })
    })
    this.hasPrompt$ = this.promptForm.controls.text.valueChanges.pipe(
      map((text: string | null): boolean => this.validatePrompt(text)),
      startWith(false),
      shareReplay(1)
    );
  }


  async onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      await this.handlePrompt();
    }
  }

  async handlePrompt(): Promise<void> {
    console.log("Handle prompt: ", this.promptForm);

    if (this.isLoading) {
      return;
    }

    if (this.promptForm.invalid) {
      this.markPromptFormAsNotOk();
      return;
    }

    const prompt: Prompt =
      this.promptForm.value as Prompt

    await this.sendPrompt(prompt);
  }

  private validatePrompt(text: string | null) {
    if (!text)
      return false;
    return text.length > 0;
  }

  private markPromptFormAsNotOk() {
    this.promptForm.markAsDirty();
    this.promptForm.markAllAsTouched();
  }

  private async sendPrompt(prompt: Prompt): Promise<void> {
    this.isLoading = true;
    console.log("Sending prompt: ", prompt);
    this.resumeService.sendPrompt(prompt)
      .pipe(delay(1000))
      .subscribe({
        next: (response: string) => {
          console.log('User prompt response details:', response);
          this.promptForm.reset();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error sending prompt', error);
          this.isLoading = false;
        }
      });
  }
}
