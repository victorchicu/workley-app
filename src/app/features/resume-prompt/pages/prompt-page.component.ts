import {Component, inject} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {PromptHeadlineComponent} from '../components/prompt-headline/prompt-headline.component';
import {PromptInputComponent} from '../components/prompt-input/prompt-input.component';
import {PromptActionsComponent} from '../components/prompt-actions/prompt-actions.component';
import {AsyncPipe} from '@angular/common';
import {ResumePromptService} from '../services/resume-prompt.service';

@Component({
  selector: 'app-resume-prompt',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    PromptHeadlineComponent,
    PromptInputComponent,
    PromptActionsComponent,
  ],
  templateUrl: './prompt-page.component.html',
  styleUrl: './prompt-page.component.css',
})
export class PromptPageComponent {
  readonly promptService = inject(ResumePromptService);
}
