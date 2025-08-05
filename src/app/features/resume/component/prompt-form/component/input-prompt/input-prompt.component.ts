import {Component} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {UploadResumeComponent} from './upload-resume/upload-resume.component';
import {CreateResumeComponent} from './create-resume/create-resume.component';
import {PromptService} from '../../../../core/service/prompt.service';
import {BehaviorSubject, delay, finalize, map, Observable, shareReplay, startWith} from 'rxjs';
import {AsyncPipe} from '@angular/common';
import {Router} from '@angular/router';
import {Result} from '../../../../core/result/result';
import {LoaderService} from '../../../../../../core/service/loader.service';

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

  loading$: Observable<boolean>;
  promptForm: PromptFormGroup;

  constructor(
    private readonly router: Router,
    private readonly loader: LoaderService,
    private readonly formBuilder: FormBuilder,
    private readonly promptService: PromptService,
  ) {
    this.loading$ = this.loader.loading$;
    this.promptForm = this.formBuilder.nonNullable.group({
      text: new FormControl<string>('', {
        validators: [
          Validators.required,
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

    if (this.loader.loading)
      return;

    if (this.promptForm.invalid) {
      this.markPromptFormAsNotOk();
      return;
    }

    this.loader.setLoading(true);

    const prompt: Prompt =
      this.promptForm.value as Prompt

    await this.sendPrompt(prompt);
  }

  private markPromptFormAsNotOk() {
    this.promptForm.markAsDirty();
    this.promptForm.markAllAsTouched();
  }

  private async sendPrompt(prompt: Prompt): Promise<void> {
    console.log("Sending prompt: ", prompt);
    this.promptService.prompt<Result>(prompt)
      .pipe(
        delay(3000),
        finalize(() => this.loader.setLoading(false))
      )
      .subscribe({
        next: (result: Result) => {
          console.log('Prompt result:', result);
          this.promptForm.reset();
          if (result.aggregateId) {
            this.router.navigate(['/resume', result.aggregateId]);
          }
        },
        error: (error) => {
          console.error('Error sending prompt', error);
          this.router.navigate(['/error']);
        }
      });
  }
}
