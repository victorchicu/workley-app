import {
  ChangeDetectionStrategy,
  Component
} from '@angular/core';
import {PromptInputComponent} from '../../resume-prompt/components/prompt-input/prompt-input.component';
import {ChatDisclaimerComponent} from '../components/chat-disclaimer/chat-disclaimer.component';
import {SendMessageButtonComponent} from '../components/action-buttons/send-message-button/send-message-button.component';
import {Navigation, Router} from '@angular/router';
import {
  ChatState,
  CreateChatCommandResult, Message
} from '../../../shared/models/api.objects';
import {AsyncPipe, NgForOf, NgIf} from '@angular/common';
import {BehaviorSubject, map, Observable, shareReplay} from 'rxjs';

@Component({
  selector: 'app-chat-assistant',
  standalone: true,
  imports: [
    ChatDisclaimerComponent,
    SendMessageButtonComponent,
    PromptInputComponent,
    NgIf,
    NgForOf,
    AsyncPipe,
  ],
  templateUrl: './chat-page.component.html',
  styleUrl: './chat-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatPageComponent {
  private readonly _state: BehaviorSubject<ChatState> = new BehaviorSubject<ChatState>({
    messages: [],
    loading: false,
    isTyping: false
  });

  readonly state$: Observable<ChatState> = this._state.asObservable().pipe(shareReplay(1));
  readonly messages$: Observable<Message[]> = this.state$.pipe(map(state => state.messages));
  readonly loading$: Observable<boolean> = this.state$.pipe(map(state => state.loading));
  readonly isTyping$: Observable<boolean | undefined> = this.state$.pipe(map(state => state.isTyping));

  constructor(private router: Router) {
    const navigation: Navigation | null = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      const state = navigation.extras.state as CreateChatCommandResult;
      console.log("Chat state: ", state);
    }
  }

  onSendMessage() {

  }
}
