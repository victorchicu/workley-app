import {Component} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {PromptHeadlineComponent} from './component/prompt-headline/prompt-headline.component';
import {PromptInputComponent, PromptForm} from './component/prompt-input/prompt-input.component';
import {CreateResumeButtonComponent} from './component/action-buttons/create-resume-button/create-resume-button.component';
import {UploadFileButtonComponent} from './component/action-buttons/upload-file-button/upload-file-button.component';
import {delay, finalize, Observable} from 'rxjs';
import {Router} from '@angular/router';
import {LoaderService} from '../../shared/service/loader.service';
import {
  ActionCommandResult, CreateChatCommand
} from '../../core/application/models/agent.models';
import {CommandService} from '../../core/application/service/command.service';

interface Prompt {
  text: string;
}

@Component({
  selector: 'app-resume-prompt',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    PromptHeadlineComponent,
    PromptInputComponent,
    CreateResumeButtonComponent,
    UploadFileButtonComponent
  ],
  templateUrl: './resume-prompt.component.html',
  styleUrl: './resume-prompt.component.css',
})
export class ResumePromptComponent {
  loading$: Observable<boolean>;

  constructor(
    private readonly router: Router,
    private readonly loader: LoaderService,
    private readonly commandService: CommandService,
  ) {
    this.loading$ = this.loader.loading$;
  }

  async handlePrompt(form: PromptForm): Promise<void> {
    if (this.loader.loading)
      return;

    this.loader.setLoading(true);

    await this.sendRequest(form);
  }

  private async sendRequest(form: PromptForm): Promise<void> {
    const prompt: Prompt = form.value as Prompt;
    console.log("Sending request with prompt: ", prompt);
    this.commandService.execute(new CreateChatCommand(prompt.text))
      .pipe(
        delay(1000),
        finalize(() => this.loader.setLoading(false))
      )
      .subscribe({
        next: (result: ActionCommandResult) => {
          console.log('Prompt result:', result);
          if (result.chatId) {
            this.router.navigate(['/chat', result.chatId], {
              state: result
            });
          }
        },
        error: (error) => {
          console.error('Error sending request', error);
          this.router.navigate(['/error']);
        }
      });
  }
}
