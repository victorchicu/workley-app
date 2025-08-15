import {Component, EventEmitter, inject, Input, Output} from '@angular/core';
import {CreateResumeButtonComponent} from '../action-buttons/create-resume-button/create-resume-button.component';
import {UploadFileButtonComponent} from '../action-buttons/upload-file-button/upload-file-button.component';
import {ResumePromptService} from '../../services/resume-prompt.service';
import {AsyncPipe} from '@angular/common';

@Component({
  selector: 'app-prompt-actions',
  standalone: true,
  imports: [
    CreateResumeButtonComponent,
    UploadFileButtonComponent,
    AsyncPipe
  ],
  templateUrl: './prompt-actions.component.html',
  styleUrl: './prompt-actions.component.css'
})
export class PromptActionsComponent {
  readonly promptService = inject(ResumePromptService);
}
