import {
  AfterViewInit,
  Component, computed, ElementRef, inject, ViewChild
} from '@angular/core';
import {PromptInputFormComponent} from '../prompt/components/prompt-input-form/prompt-input-form.component';
import {Navigation, Router} from '@angular/router';
import {
  CreateChatCommandResult, Message
} from '../../shared/models/command.models';
import {AsyncPipe, DatePipe, NgForOf, NgIf} from '@angular/common';
import {ChatState} from './chat-state.service';
import {Observable} from 'rxjs';
import {PromptSendButtonComponent} from '../prompt/components/prompt-send-button/prompt-send-button.component';
import {ChatDisclaimerComponent} from './components/chat-disclaimer/chat-disclaimer.component';
import {PromptState} from '../../shared/services/prompt-state.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    PromptInputFormComponent,
    NgIf,
    AsyncPipe,
    DatePipe,
    NgForOf,
    PromptSendButtonComponent,
    ChatDisclaimerComponent,
  ],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css',
})
export class ChatComponent {
  readonly chat: ChatState = inject(ChatState);
  readonly prompt: PromptState = inject(PromptState);

  viewModel = computed(() => ({
    form: this.prompt.form,
    isLineWrapped: this.prompt.lineWrapDetected()
  }));

  error$: Observable<string | null> = this.chat.error$;
  chatId: string | null = null;
  messages$: Observable<Message[]> = this.chat.messages$;
  isLoading$: Observable<boolean> = this.chat.isLoading$;
  protected readonly Date: DateConstructor = Date;
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  constructor(readonly router: Router) {
    const navigation: Navigation | null = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      const result = navigation.extras.state as CreateChatCommandResult;
      console.log("Create chat command result: ", result);
      this.handleResult(result);
    }
  }

  onSubmit() {
    console.log("On Submit")
    if (!this.chatId)
      return;
    // this.chat.sendMessage(this.chatId, ).subscribe({
    //   next: (response: CreateChatCommandResult) => {
    //     console.log("Navigating to chat with id:", response.chatId)
    //     this.router.navigate(['/chat', response.chatId], {state: response})
    //       .then();
    //   },
    //   error: (cause) => {
    //     console.error("Chat creation failed:", cause);
    //     this.router.navigate(['/error'])
    //       .then();
    //   }
    // });
  }

  private handleResult(result: CreateChatCommandResult) {
    this.chat.addMessage(result.chatId, result.message);
    // Optionally fetch full history to ensure consistency
    // this.loadChatHistory();
  }

  private loadChatHistory() {
    if (!this.chatId) return;
    console.log('Loading chat history for:', this.chatId);
    this.chat.loadChatHistory(this.chatId);
  }

  private scrollToBottom(): void {
    if (this.messagesContainer) {
      const element = this.messagesContainer.nativeElement;
      element.scrollTop = element.scrollHeight;
    }
  }
}
