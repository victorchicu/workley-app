import {
  AfterViewChecked,
  ChangeDetectionStrategy,
  Component, ElementRef, OnDestroy, OnInit, ViewChild,
} from '@angular/core';
import {PromptInputComponent} from '../prompt-form/prompt-input/prompt-input.component';
import {PromptBottomTextComponent} from '../prompt-form/prompt-bottom-text/prompt-bottom-text.component';
import {SendMessageComponent} from '../prompt-form/action-buttons/send-message/send-message.component';
import {Navigation, Router} from '@angular/router';
import {AgentService} from '../../../../core/application/agent/agent.service';
import {
  CreateChatCommandResult,
  Message,
  Prompt,
  SendMessageCommandResult
} from '../../../../core/application/agent/agent.models';
import {Observable, Subject, takeUntil} from 'rxjs';
import {AsyncPipe, NgForOf, NgIf} from '@angular/common';
import {AgentChatService} from './agent-chat.service';

@Component({
  selector: 'app-agent-chat',
  standalone: true,
  imports: [
    PromptInputComponent,
    PromptBottomTextComponent,
    SendMessageComponent,
    NgForOf,
    NgIf,
    AsyncPipe,
  ],
  templateUrl: './agent-chat.component.html',
  styleUrl: './agent-chat.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AgentChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  private destroy$ = new Subject<void>();
  private shouldScrollToBottom = false;

  messages$!: Observable<Message[]>;
  loading$!: Observable<boolean>;
  isTyping$!: Observable<boolean | undefined>;
  error$!: Observable<string | undefined>;
  chatId$!: Observable<string | undefined>;

  currentMessage = '';

  constructor(private router: Router, private agentChatService: AgentChatService) {
    this.messages$ = this.agentChatService.messages$;
    this.loading$ = this.agentChatService.loading$;
    this.isTyping$ = this.agentChatService.isTyping$;
    this.error$ = this.agentChatService.error$;
    this.chatId$ = this.agentChatService.chatId$;
    const navigation: Navigation | null = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      const state = navigation.extras.state as CreateChatCommandResult;
      console.log("Chat state: ", state);
      if (state.chatId && state.message) {
        this.agentChatService.initializeChat(state.chatId, state.message);
      }
    }
  }

  ngOnInit(): void {
    this.messages$.pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.shouldScrollToBottom = true;
      });
    this.isTyping$.pipe(takeUntil(this.destroy$)).subscribe(isTyping => {
      if (isTyping) {
        this.shouldScrollToBottom = true;
      }
    });
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
  }

  onSendMessage(): void {
    if (!this.currentMessage.trim()) {
      return;
    }

    this.chatId$.pipe(takeUntil(this.destroy$))
      .subscribe(chatId => {
        if (!chatId) {
          const prompt: Prompt = {
            text: this.currentMessage.trim()
          };
          this.agentChatService.createChat(prompt)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (result: CreateChatCommandResult) => {
                console.log('Chat created:', result);
              },
              error: (error) => {
                console.error('Error creating chat:', error);
              }
            });
        } else {
          const message: Message = {
            role: 'USER',
            content: this.currentMessage.trim()
          }
          this.agentChatService.sendMessage(message)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (result: SendMessageCommandResult) => {
                console.log('Message sent:', result);
              },
              error: (error) => {
                console.error('Error sending message:', error);
              }
            });
        }
      });
    this.currentMessage = '';
  }

  onInputChange(value: string): void {
    this.currentMessage = value;
    this.agentChatService.updateCurrentUserMessage(value);
  }

  onRetryMessage(message: Message): void {
    if (message.status === 'error' && message.content) {
      this.agentChatService.sendMessage(message).pipe(
        takeUntil(this.destroy$)
      ).subscribe();
    }
  }

  clearError(): void {
    this.agentChatService.clearError();
  }


  private scrollToBottom(): void {
    try {
      if (this.scrollContainer) {
        const element = this.scrollContainer.nativeElement;
        element.scrollTop = element.scrollHeight;
      }
    } catch (err) {
      console.error('Scroll error:', err);
    }
  }
}
