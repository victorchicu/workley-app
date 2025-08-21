import {
  AfterViewInit,
  Component, computed, ElementRef, inject, ViewChild
} from '@angular/core';
import {InputComponent} from '../prompt/ui/input/input.component';
import {Navigation, Router} from '@angular/router';
import {
  CreateChatCommandResult, Message
} from '../../shared/models/command.models';
import {AsyncPipe, DatePipe, NgForOf, NgIf} from '@angular/common';
import {ChatFacade} from './chat.facade';
import {Observable} from 'rxjs';
import {SubmitComponent} from '../prompt/ui/submit/submit.component';
import {ChatDisclaimerComponent} from './ui/chat-disclaimer/chat-disclaimer.component';
import {PromptFacade} from '../../shared/services/prompt.facade';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    InputComponent,
    NgIf,
    AsyncPipe,
    DatePipe,
    NgForOf,
    SubmitComponent,
    ChatDisclaimerComponent,
  ],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css',
})
export class ChatComponent implements AfterViewInit {
  readonly chat: ChatFacade = inject(ChatFacade);
  readonly prompt: PromptFacade = inject(PromptFacade);

  viewModel = computed(() => ({
    form: this.prompt.form,
  }));

  chatId: string | null = null;
  messages$: Observable<Message[]> = this.chat.messages$;
  isLoading$: Observable<boolean> = this.chat.isLoading$;
  error$: Observable<string | null> = this.chat.error$;
  protected readonly Date: DateConstructor = Date;
  @ViewChild('promptRef') promptInput!: InputComponent;
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  constructor(readonly router: Router) {
    const navigation: Navigation | null = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      const result = navigation.extras.state as CreateChatCommandResult;
      console.log("Create chat command result: ", result);
      this.handleCreateChatCommandResult(result);
    }
  }

  ngAfterViewInit() {
    this.messages$.subscribe(() => {
      setTimeout(() => this.scrollToBottom(), 100);
    });
  }

  sendMessage(content: SubmitEvent) {
    console.log("Sending message:", content);
    // if (!content.trim() || !this.chatId) return;
    // this.facade.sendMessage(this.chatId, content);
    // this.promptInput.clear(); // Clear input after sending
  }

  onSubmit() {

  }

  private handleCreateChatCommandResult(result: CreateChatCommandResult) {
    console.log('Handling initial message:', result);
    this.chat.createChat(result.chatId, result.message);
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
