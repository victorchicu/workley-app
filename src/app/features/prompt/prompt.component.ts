import {Component, computed, DestroyRef, inject} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {PromptHeadlineComponent} from './components/prompt-headline/prompt-headline.component';
import {PromptInputFormComponent} from './components/prompt-input-form/prompt-input-form.component';
import {PromptState} from './prompt-state.service';
import {
  PromptSendButtonComponent
} from './components/prompt-send-button/prompt-send-button.component';
import {PromptFileUploadComponent} from './components/prompt-file-upload/prompt-file-upload.component';
import {Router} from '@angular/router';
import {CreateChatCommandResult} from '../../shared/models/command.models';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-prompt',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    PromptHeadlineComponent,
    PromptInputFormComponent,
    PromptSendButtonComponent,
    PromptFileUploadComponent
  ],
  templateUrl: './prompt.component.html',
  styleUrl: './prompt.component.css',
})
export class PromptComponent {
  readonly router: Router = inject(Router);
  readonly prompt: PromptState = inject(PromptState);
  readonly destroyRef: DestroyRef = inject(DestroyRef);

  viewModel = computed(() => ({
    form: this.prompt.form,
    error: this.prompt.error(),
    isSubmitting: this.prompt.isSubmitting(),
    isLineWrapped: this.prompt.lineWrapDetected(),
  }));

  sendPrompt() {
    this.prompt.createChat()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
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
