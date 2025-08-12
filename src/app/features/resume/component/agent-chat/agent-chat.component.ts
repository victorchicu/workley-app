import {
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';
import {PromptInputComponent} from '../prompt-form/prompt-input/prompt-input.component';
import {PromptBottomTextComponent} from '../prompt-form/prompt-bottom-text/prompt-bottom-text.component';
import {SendMessageComponent} from '../prompt-form/action-buttons/send-message/send-message.component';
import {Navigation, Router} from '@angular/router';
import {NgClass, NgForOf, NgIf} from '@angular/common';
import {AgentService} from '../../../../core/application/agent/agent.service';
import {CreateChatCommandResult} from '../../../../core/application/agent/agent.models';

@Component({
  selector: 'app-agent-chat',
  standalone: true,
  imports: [
    PromptInputComponent,
    PromptBottomTextComponent,
    SendMessageComponent,
  ],
  templateUrl: './agent-chat.component.html',
  styleUrl: './agent-chat.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AgentChatComponent {

  constructor(
    private router: Router,
    private agentService: AgentService
  ) {
    const navigation: Navigation | null = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      const state = navigation.extras.state as CreateChatCommandResult;
      console.log("Chat state: ", state);
    }
  }
}
