import {Component} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {UploadButtonComponent} from './upload-button/upload-button.component';
import {CreateButtonComponent} from './create-button/create-button.component';
import {PromptService} from '../../services/prompt.service';

export interface PromptControl {
  text: FormControl<string | null>;
}

export type PromptFormGroup = FormGroup<PromptControl>;

export interface Prompt {
  text: string
}

@Component({
  selector: 'app-prompt-form',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    UploadButtonComponent,
    CreateButtonComponent
  ],
  templateUrl: './prompt-form.component.html',
  styleUrl: './prompt-form.component.css'
})
export class PromptFormComponent {

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
  }

  async onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      await this.handlePrompt();
    }
  }

  async handlePrompt(): Promise<void> {
    console.log("Handle prompt: ", this.promptForm);

    if (this.promptForm.invalid) {
      this.markPromptFormAsNotOk();
      return;
    }

    const prompt: Prompt =
      this.promptForm.value as Prompt

    await this.sendPrompt(prompt);
  }

  private markPromptFormAsNotOk() {
    this.promptForm.markAsDirty();
    this.promptForm.markAllAsTouched();
  }

  private async sendPrompt(prompt: Prompt) {
    this.resumeService.sendPrompt(prompt)
      .subscribe({
        next: (response: string) => {
          console.log('Prompt response details:', response);
          this.promptForm.reset()
        },
        error: (error) => {
          console.error('Error sending prompt', error);
        }
      });
  }
}
