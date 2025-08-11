import {AfterViewChecked, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {PromptInputComponent} from '../prompt-form/prompt-input/prompt-input.component';
import {PromptBottomTextComponent} from '../prompt-form/prompt-bottom-text/prompt-bottom-text.component';
import {SendMessageComponent} from '../prompt-form/action-buttons/send-message/send-message.component';
import {Navigation, Router} from '@angular/router';
import {CreateChatCommandResult} from '../../../../core/application/agent/command/create-chat-command-result';
import {NgClass, NgForOf, NgIf} from '@angular/common';
import {finalize, Subject, takeUntil} from 'rxjs';
import {ChatViewState} from './objects/chat-view-state';
import {AgentService} from '../../../../core/application/agent/agent.service';
import {Message} from './objects/message';
import {GetChatHistoryQueryResult} from '../../../../core/application/agent/query/get-chat-history-query-result';

@Component({
  selector: 'app-agent-chat',
  standalone: true,
  imports: [
    PromptInputComponent,
    PromptBottomTextComponent,
    SendMessageComponent,
    NgIf,
    NgClass,
    NgForOf,
  ],
  templateUrl: './agent-chat.component.html',
  styleUrl: './agent-chat.component.css'
})
export class AgentChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  chatViewState: ChatViewState = {
    chatId: '',
    messages: [],
    isLoading: false,
    error: null
  };
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;
  private destroy$ = new Subject<void>();
  private shouldScrollToBottom = false;

  constructor(
    private router: Router,
    private agentService: AgentService
  ) {
    const navigation: Navigation | null = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      const state = navigation.extras.state as CreateChatCommandResult;
      this.chatViewState.chatId = state.chatId;
    }
  }

  ngOnInit(): void {
    this.agentService.messages$
      .pipe(takeUntil(this.destroy$))
      .subscribe((messages: Message[]) => {
        this.chatViewState.messages = messages;
        this.shouldScrollToBottom = true;
      });

    if (this.chatViewState.chatId) {
      this.loadChatHistory();
    } else {
      console.error('No chatId provided');
      this.chatViewState.error = 'Chat session not found';
    }
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.agentService.clearMessages();
  }

  loadChatHistory(): void {
    this.chatViewState.error = null;
    this.chatViewState.isLoading = true;
    this.agentService.getChatHistoryQuery({chatId: this.chatViewState.chatId})
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.chatViewState.isLoading = false)
      )
      .subscribe({
        next: (result: GetChatHistoryQueryResult) => {
          if (!this.chatViewState.messages) {
            this.chatViewState.messages = [];
          }

          console.log(result)

          if (!result || !result.data) {
            console.warn('No messages in response');
            return;
          }

          const existingIds = new Set(this.chatViewState.messages.map((message: Message): string => message.id));

          const newMessages: Message[] =
            result.data.filter((message: Message) => !existingIds.has(message.id));

          this.chatViewState.messages =
            [...this.chatViewState.messages, ...newMessages];

          this.shouldScrollToBottom = true;
        },
        error: (error) => {
          console.error('Failed to load chat:', error);
          this.chatViewState.error = 'Failed to load chat';
        }
      });
  }

  toLocalTimeString(date: Date): string {
    const d = new Date(date);
    return d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }

  private scrollToBottom(): void {
    try {
      if (this.scrollContainer) {
        const element = this.scrollContainer.nativeElement;
        element.scrollTop = element.scrollHeight;
      }
    } catch (err) {
      console.error('Could not scroll to bottom:', err);
    }
  }
}
