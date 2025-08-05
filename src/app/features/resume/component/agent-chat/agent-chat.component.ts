import { Component } from '@angular/core';
import {InputPromptComponent} from '../prompt-form/component/input-prompt/input-prompt.component';
import {NgForOf} from '@angular/common';
import {TextHeadlineComponent} from '../prompt-form/component/text-headline/text-headline.component';
import {TextBottomLineComponent} from '../prompt-form/component/text-bottom-line/text-bottom-line.component';

@Component({
  selector: 'app-agent-chat',
  standalone: true,
  imports: [
    InputPromptComponent,
    NgForOf,
    TextHeadlineComponent,
    TextBottomLineComponent
  ],
  templateUrl: './agent-chat.component.html',
  styleUrl: './agent-chat.component.css'
})
export class AgentChatComponent {
  messages: string[] = [];
}
