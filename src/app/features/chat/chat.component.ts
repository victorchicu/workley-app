import {
  ChangeDetectionStrategy,
  Component, inject
} from '@angular/core';
import {InputComponent} from '../prompt/ui/input/input.component';
import {ChatDisclaimerComponent} from './ui/chat-disclaimer/chat-disclaimer.component';
import {SendMessageComponent} from './ui/action-buttons/send-message/send-message.component';
import {Navigation, Router} from '@angular/router';
import {
  CreateChatCommandResult, Message
} from '../../shared/models/command.models';
import {PromptFacade} from '../prompt/prompt.facade';

@Component({
  selector: 'app-chat-assistant',
  standalone: true,
  imports: [
    ChatDisclaimerComponent,
    SendMessageComponent,
    InputComponent,
  ],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatComponent {
  readonly promptFacade: PromptFacade = inject(PromptFacade);

  constructor(private router: Router) {
    const navigation: Navigation | null = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      const result = navigation.extras.state as CreateChatCommandResult;
      console.log("Create chat command result: ", result);
    }
  }
}
