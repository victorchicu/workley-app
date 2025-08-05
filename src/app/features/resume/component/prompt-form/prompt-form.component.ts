import {Component} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {TextHeadlineComponent} from './component/text-headline/text-headline.component';
import {InputPromptComponent, Prompt, PromptFormGroup} from './component/input-prompt/input-prompt.component';
import {TextBottomLineComponent} from './component/text-bottom-line/text-bottom-line.component';
import {CreateResumeComponent} from './component/input-prompt/create-resume/create-resume.component';
import {UploadResumeComponent} from './component/input-prompt/upload-resume/upload-resume.component';
import {delay, finalize, Observable} from 'rxjs';
import {Router} from '@angular/router';
import {LoaderService} from '../../../../core/service/loader.service';
import {PromptService} from '../../../../core/service/prompt.service';
import {Result} from '../../../../core/service/result/result';

@Component({
  selector: 'app-resume-page',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    TextHeadlineComponent,
    InputPromptComponent,
    TextBottomLineComponent,
    CreateResumeComponent,
    UploadResumeComponent
  ],
  templateUrl: './prompt-form.component.html',
  styleUrl: './prompt-form.component.css',
})
export class PromptFormComponent {
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
        delay(1000),
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
