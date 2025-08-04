import {Component} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {UploadResumeComponent} from './upload-resume/upload-resume.component';
import {CreateResumeComponent} from './create-resume/create-resume.component';
import {PromptService} from '../../../../core/service/prompt.service';
import {delay, map, Observable, shareReplay, startWith} from 'rxjs';
import {AsyncPipe} from '@angular/common';
import {Router} from '@angular/router';
import {Result} from '../../../../core/result/result';

export interface PromptControl {
  text: FormControl<string | null>;
}

export type PromptFormGroup = FormGroup<PromptControl>;

export interface Prompt {
  text: string
}

@Component({
  selector: 'app-input-prompt',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    UploadResumeComponent,
    CreateResumeComponent,
    AsyncPipe
  ],
  templateUrl: './input-prompt.component.html',
  styleUrl: './input-prompt.component.css'
})
export class InputPromptComponent {

  isLoading: boolean = false;
  hasPrompt$: Observable<boolean>;
  promptForm: PromptFormGroup;

  constructor(
    private readonly router: Router,
    private readonly formBuilder: FormBuilder,
    private readonly promptService: PromptService
  ) {
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
    this.promptService.prompt<Result>(prompt)
      .pipe(delay(1000))
      .subscribe({
        next: (result: Result) => {
          console.log('User prompt response details:', result);
          this.promptForm.reset();
          this.isLoading = false;
          this.router.navigate(['/resume', result.aggregateId]);
        },
        error: (error) => {
          console.error('Error sending prompt', error);
          this.isLoading = false;
        }
      });
  }
}
