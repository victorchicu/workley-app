import {Component, computed, inject} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {PromptHeadlineComponent} from './components/prompt-headline/prompt-headline.component';
import {PromptInputComponent} from './components/prompt-input/prompt-input.component';
import {PromptState} from './prompt-state.service';
import {
  PromptSubmitComponent
} from './components/prompt-submit/prompt-submit.component';
import {PromptFileUploadComponent} from './components/prompt-file-upload/prompt-file-upload.component';
import {Router} from '@angular/router';
import {CreateChatCommandResult} from '../../shared/models/command.models';

@Component({
  selector: 'app-prompt',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    PromptHeadlineComponent,
    PromptInputComponent,
    PromptSubmitComponent,
    PromptFileUploadComponent
  ],
  templateUrl: './prompt.component.html',
  styleUrl: './prompt.component.css',
})
export class PromptComponent {
  private readonly router: Router = inject(Router);
  private readonly prompt: PromptState = inject(PromptState);

  viewModel = computed(() => ({
    form: this.prompt.form,
    error: this.prompt.error(),
    submitting: this.prompt.submitting(),
    hasLineBreaks: this.prompt.hasLineBreaks(),
  }));

  handlePrompt() {
    this.prompt.createChat().subscribe({
      next: (response: CreateChatCommandResult) => {
        console.log("Navigating to chat with id:", response.chatId)
        this.router.navigate(['/chat', response.chatId], {state: response})
          .then();
      },
      error: (cause) => {
        console.error("Chat creation failed:", cause);
        this.router.navigate(['/error'])
          .then();
      }
    });
  }
}
