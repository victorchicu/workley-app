import {Component} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {PromptHeadlineComponent} from './prompt-headline/prompt-headline.component';
import {PromptInputComponent, Prompt, PromptForm} from './prompt-input/prompt-input.component';
import {BuildResumeComponent} from './action-buttons/build-resume/build-resume.component';
import {UploadResumeComponent} from './action-buttons/upload-resume/upload-resume.component';
import {delay, finalize, Observable} from 'rxjs';
import {Router} from '@angular/router';
import {LoaderService} from '../../../../core/application/loader.service';
import {AgentService} from '../../../../core/application/agent/agent.service';
import {CreateChatCommandResult} from '../../../../core/application/agent/command/create-chat-command-result';
import {CreateChatCommand} from '../../../../core/application/agent/command/create-chat-command';

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
    private readonly agentService: AgentService,
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

    const command: CreateChatCommand = new CreateChatCommand(prompt);
    this.agentService.executeCommand<CreateChatCommand, CreateChatCommandResult>(command)
      .pipe(
        delay(1000),
        finalize(() => this.loader.setLoading(false))
      )
      .subscribe({
        next: (result: CreateChatCommandResult) => {
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
