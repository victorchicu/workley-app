import { Component } from '@angular/core';
import {PromptInputComponent} from '../prompt-form/prompt-input/prompt-input.component';
import {PromptBottomTextComponent} from '../prompt-form/prompt-bottom-text/prompt-bottom-text.component';
import {SendMessageComponent} from '../prompt-form/action-buttons/send-message/send-message.component';
import {BuildResumeComponent} from '../prompt-form/action-buttons/build-resume/build-resume.component';
import {UploadResumeComponent} from '../prompt-form/action-buttons/upload-resume/upload-resume.component';

@Component({
  selector: 'app-agent-chat',
  standalone: true,
  imports: [
    PromptInputComponent,
    PromptBottomTextComponent,
    SendMessageComponent,
    BuildResumeComponent,
    UploadResumeComponent
  ],
  templateUrl: './agent-chat.component.html',
  styleUrl: './agent-chat.component.css'
})
export class AgentChatComponent {
  messages: string[] = [];
}
