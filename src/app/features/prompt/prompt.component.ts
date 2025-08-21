import {Component, computed, inject} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HeadlineComponent} from './ui/headline/headline.component';
import {InputComponent} from './ui/input/input.component';
import {PromptFacade} from '../../shared/services/prompt.facade';
import {
  SubmitComponent
} from './ui/submit/submit.component';
import {UploadFileComponent} from './ui/upload-file/upload-file.component';
import {Router} from '@angular/router';
import {CreateChatCommandResult} from '../../shared/models/command.models';

@Component({
  selector: 'app-prompt',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    HeadlineComponent,
    InputComponent,
    SubmitComponent,
    UploadFileComponent
  ],
  templateUrl: './prompt.component.html',
  styleUrl: './prompt.component.css',
})
export class PromptComponent {
  private readonly router: Router = inject(Router);
  private readonly facade: PromptFacade = inject(PromptFacade);

  viewModel = computed(() => ({
    form: this.facade.form,
    error: this.facade.error(),
    submitting: this.facade.submitting(),
    hasLineBreaks: this.facade.hasLineBreaks(),
  }));

  onSubmit() {
    this.facade.createChat().subscribe({
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
