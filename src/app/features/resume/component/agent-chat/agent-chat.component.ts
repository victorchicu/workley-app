import { Component } from '@angular/core';
import {PromptInputComponent} from '../prompt-form/prompt-input/prompt-input.component';
import {PromptBottomTextComponent} from '../prompt-form/prompt-bottom-text/prompt-bottom-text.component';

@Component({
  selector: 'app-agent-chat',
  standalone: true,
  imports: [
    PromptInputComponent,
    PromptBottomTextComponent
  ],
  templateUrl: './agent-chat.component.html',
  styleUrl: './agent-chat.component.css'
})
export class AgentChatComponent {
  messages: string[] = [];
}
