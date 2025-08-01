import {Component} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {UploadButtonComponent} from './upload-button/upload-button.component';
import {CreateButtonComponent} from './create-button/create-button.component';
import {ResumeService} from '../../services/resume.service';
import {AsyncTaskResponse} from '../../services/objects/async-task-response';
import {ProcessingTask} from '../../services/objects/processing-task';

export interface PromptControl {
  text: FormControl<string | null>;
}

export type PromptFormGroup = FormGroup<PromptControl>;

export interface PromptValueRequest {
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

  constructor(private readonly formBuilder: FormBuilder, private readonly resumeService: ResumeService) {
    this.promptForm = this.formBuilder.nonNullable.group({
      text: new FormControl<string>('', {
        validators: [Validators.required,
          Validators.minLength(1),
          Validators.maxLength(1000),
        ]
      })
    })
  }

  handlePrompt(): void {
    console.log("Handle prompt: ", this.promptForm);
    if (this.promptForm.invalid) {
      this.markPromptForm();
      return;
    }
    const promptValueRequest: PromptValueRequest = this.promptForm.value as PromptValueRequest
    this.resumeService.createFromPrompt(promptValueRequest)
      .subscribe({
        next: (response: AsyncTaskResponse<ProcessingTask>) => {
          console.log('Resume creation task initiated successfully. Task ID:', response.taskId);
          console.log("Task details: ", response.result)
          this.promptForm.reset()
        },
        error: (error) => {
          console.error('Error creating resume from prompt', error);
        }
      });
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.handlePrompt();
    }
  }

  private markPromptForm() {
    this.promptForm.markAsDirty();
    this.promptForm.markAllAsTouched();
  }
}
