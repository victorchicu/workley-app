import {Component} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {PromptHeadlineComponent} from './prompt-headline/prompt-headline.component';
import {PromptInputComponent, Prompt, PromptForm} from './prompt-input/prompt-input.component';
import {BuildResumeComponent} from './action-buttons/build-resume/build-resume.component';
import {UploadResumeComponent} from './action-buttons/upload-resume/upload-resume.component';
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
    PromptHeadlineComponent,
    PromptInputComponent,
    BuildResumeComponent,
    UploadResumeComponent
  ],
  templateUrl: './prompt-form.component.html',
  styleUrl: './prompt-form.component.css',
})
export class PromptFormComponent {
  loading$: Observable<boolean>;

  constructor(
    private readonly router: Router,
    private readonly loader: LoaderService,
    private readonly promptService: PromptService,
  ) {
    this.loading$ = this.loader.loading$;
  }

  async handlePrompt(form: PromptForm): Promise<void> {
    console.log("Handle prompt on press enter: ", form);

    if (this.loader.loading)
      return;

    this.loader.setLoading(true);

    await this.sendRequest(form);
  }

  private async sendRequest(form: PromptForm): Promise<void> {
    const prompt: Prompt = form.value as Prompt;
    console.log("Sending request with prompt: ", prompt);

    this.promptService.handlePrompt<Result>(prompt)
      .pipe(
        delay(1000),
        finalize(() => this.loader.setLoading(false))
      )
      .subscribe({
        next: (result: Result) => {
          console.log('Prompt result:', result);
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
