import {AfterViewChecked, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {PromptInputComponent} from '../prompt-form/prompt-input/prompt-input.component';
import {PromptBottomTextComponent} from '../prompt-form/prompt-bottom-text/prompt-bottom-text.component';
import {SendMessageComponent} from '../prompt-form/action-buttons/send-message/send-message.component';
import {Navigation, Router} from '@angular/router';
import {CreateChatCommandResult} from '../../../../core/application/agent/command/create-chat-command-result';
import {NgClass, NgForOf, NgIf} from '@angular/common';
import {finalize, Subject, takeUntil} from 'rxjs';
import {ChatViewState} from './states/chat-view-state';
import {AgentService} from '../../../../core/application/agent/agent.service';
import {ChatMessage} from './states/chat-message';

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
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  chatState: ChatViewState = {
    chatId: '',
    messages: [],
    isLoading: false,
    error: null
  };

  messageInput: string = '';
  isInputDisabled: boolean = false;
  private destroy$ = new Subject<void>();
  private shouldScrollToBottom = false;

  constructor(
    private router: Router,
    private agentService: AgentService
  ) {
    // Handle navigation state
    const navigation: Navigation | null = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      const state = navigation.extras.state as CreateChatCommandResult;
      this.chatState.chatId = state.chatId;
      this.chatState.messages.push({
        id: this.generateMessageId(),
        content: state.prompt.text,
        sender: 'agent',
        timestamp: new Date(),
        status: 'sent'
      });
    }
  }

  ngOnInit(): void {
    this.agentService.messages$
      .pipe(takeUntil(this.destroy$))
      .subscribe(messages => {
        this.chatState.messages = messages;
        this.shouldScrollToBottom = true;
      });

    if (this.chatState.chatId) {
      this.loadChatHistory();
    } else {
      console.error('No chatId provided');
      this.chatState.error = 'Chat session not found';
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
    this.chatState.isLoading = true;
    this.chatState.error = null;
    this.agentService.getChatHistoryQuery({ chatId: this.chatState.chatId })
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.chatState.isLoading = false)
      )
      .subscribe({
        next: (result) => {
          const existingIds = new Set(this.chatState.messages.map(m => m.id));
          const newMessages = result.messages.filter(m => !existingIds.has(m.id));
          this.chatState.messages = [...this.chatState.messages, ...newMessages];
          this.shouldScrollToBottom = true;
        },
        error: (error) => {
          console.error('Failed to load chat history:', error);
          this.chatState.error = 'Failed to load chat history';
        }
      });
  }

  sendMessage(): void {
    if (!this.messageInput.trim() || this.isInputDisabled) {
      return;
    }

    const userMessage: ChatMessage = {
      id: this.generateMessageId(),
      content: this.messageInput.trim(),
      sender: 'user',
      timestamp: new Date(),
      status: 'sending'
    };

    // Add message optimistically
    this.agentService.addOptimisticMessage(userMessage);
    this.shouldScrollToBottom = true;

    // Clear input and disable while sending
    const messageContent = this.messageInput;
    this.messageInput = '';
    this.isInputDisabled = true;

    // Send message to backend
    this.agentService.sendMessage({
      chatId: this.chatState.chatId,
      content: messageContent
    })
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.isInputDisabled = false;
        })
      )
      .subscribe({
        next: (result) => {
          // Update user message status
          this.agentService.updateMessageStatus(userMessage.id, 'sent');
          this.shouldScrollToBottom = true;
        },
        error: (error) => {
          console.error('Failed to send message:', error);
          this.agentService.updateMessageStatus(userMessage.id, 'error');
          this.chatState.error = 'Failed to send message. Please try again.';
        }
      });
  }

  onInputChange(value: string): void {
    this.messageInput = value;
  }

  onEnterPressed(): void {
    this.sendMessage();
  }

  retryMessage(message: ChatMessage): void {
    if (message.status === 'error') {
      this.messageInput = message.content;
      // Remove the failed message
      const updatedMessages = this.chatState.messages.filter(m => m.id !== message.id);
      this.agentService.clearMessages();
      updatedMessages.forEach(m => this.agentService.addOptimisticMessage(m));
      // Retry sending
      this.sendMessage();
    }
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

  private generateMessageId(): string {
    return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Helper method for template
  formatTime(date: Date): string {
    const d = new Date(date);
    return d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }
}
