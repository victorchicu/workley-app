import { Component } from '@angular/core';
import {InputPromptComponent} from '../prompt-form/component/input-prompt/input-prompt.component';
import {NgForOf} from '@angular/common';

@Component({
  selector: 'app-agent-chat',
  standalone: true,
  imports: [
    InputPromptComponent,
    NgForOf
  ],
  templateUrl: './agent-chat.component.html',
  styleUrl: './agent-chat.component.css'
})
export class AgentChatComponent {
  messages: string[] = [];
}
