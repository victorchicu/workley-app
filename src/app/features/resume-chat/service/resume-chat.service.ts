import { Injectable } from '@angular/core';
import {BehaviorSubject, catchError, finalize, map, Observable, shareReplay, tap, throwError} from 'rxjs';
import {
  AgentCommand, AgentCommandResult, AgentQuery, AgentQueryResult,
  ChatState,
  CreateChatCommand,
  CreateChatCommandResult, GetChatQuery, GetChatQueryResult,
  Message,
  Prompt, SendMessageCommand, SendMessageCommandResult
} from '../../../core/application/agent/agent.models';
import {HttpClient} from '@angular/common/http';
import {AgentService} from '../../../core/application/agent/agent.service';

@Injectable({
  providedIn: 'root'
})
export class ResumeChatService {

  readonly apiBaseUrl: string = '/api';
  private readonly _state: BehaviorSubject<ChatState> = new BehaviorSubject<ChatState>({
    messages: [],
    loading: false,
    isTyping: false
  });

  readonly state$: Observable<ChatState> = this._state.asObservable().pipe(shareReplay(1));
  readonly messages$: Observable<Message[]> = this.state$.pipe(map(state => state.messages));
  readonly loading$: Observable<boolean> = this.state$.pipe(map(state => state.loading));
  readonly chatId$: Observable<string | undefined> = this.state$.pipe(map(state => state.chatId));
  readonly isTyping$: Observable<boolean | undefined> = this.state$.pipe(map(state => state.isTyping));
  readonly error$: Observable<string | undefined> = this.state$.pipe(map(state => state.error));

  constructor(private readonly agentService: AgentService) {
  }

  initializeChat(chatId: string, initialMessage?: Message): void {
    const messages = initialMessage ? [initialMessage] : [];
    this.patch({
      chatId,
      messages,
      loading: false,
      error: undefined
    });
    // Start typing animation for agent response
    if (initialMessage?.role === 'USER') {
      this.setTyping(true);
      // Simulate agent typing for demo - remove this when real WebSocket/SSE is implemented
      setTimeout(() => {
        this.simulateAgentResponse();
      }, 1000);
    }
  }

  createChat(prompt: Prompt): Observable<CreateChatCommandResult> {
    const command = new CreateChatCommand(prompt);

    const userMessage: Message = {
      role: 'USER',
      content: prompt.text,
      status: 'sending'
    };

    this.addMessage(userMessage);
    this.patch({loading: true, error: undefined});

    return this.executeCommand(command).pipe(
      tap((result: CreateChatCommandResult | SendMessageCommandResult) => {
        if (result.type === 'CreateChatCommandResult') {
          // Update user message with ID from server
          this.updateMessageStatus(userMessage, 'sent', result.message.id);
          this.patch({chatId: result.chatId});
          this.setTyping(true);
        }
      })
    ) as Observable<CreateChatCommandResult>;
  }

  sendMessage(message: Message): Observable<SendMessageCommandResult> {
    const chatId = this._state.value.chatId;
    if (!chatId) {
      return throwError(() => new Error('No active chat'));
    }

    const command = new SendMessageCommand(chatId, message);

    // Add user message optimistically
    const userMessage: Message = {
      role: 'USER',
      content: message.content,
      status: 'sending'
    };

    this.addMessage(userMessage);
    this.patch({loading: true, error: undefined, currentUserMessage: ''});

    return this.executeCommand(command).pipe(
      tap((result: CreateChatCommandResult | SendMessageCommandResult) => {
        if (result.type === 'SendMessageCommandResult') {
          // Update user message with ID from server
          this.updateMessageStatus(userMessage, 'sent', result.message.id);
          this.setTyping(true);
        }
      })
    ) as Observable<SendMessageCommandResult>;
  }

  loadChatHistory(chatId: string): Observable<GetChatQueryResult> {
    const query = new GetChatQuery(chatId);
    this.patch({loading: true, error: undefined});
    return this.executeQuery(query).pipe(
      tap((result: GetChatQueryResult) => {
        if (result.type === 'GetChatQueryResult') {
          this.patch({
            chatId: result.chatId,
            messages: result.messages
          });
        }
      })) as Observable<GetChatQueryResult>;
  }

  private executeCommand(command: AgentCommand): Observable<AgentCommandResult> {
    const request$: Observable<AgentCommandResult> = this.agentService.executeCommand(command);
    return request$.pipe(
      tap((result: AgentCommandResult) => this.reduce(result)),
      catchError(err => {
        this.patch({error: normalizeError(err)});
        const messages = this._state.value.messages;
        const lastMessage = messages[messages.length - 1];
        if (lastMessage?.status === 'sending') {
          this.updateMessageStatus(lastMessage, 'error');
        }
        return throwError(() => err);
      }),
      finalize(() => this.patch({loading: false})),
      shareReplay(1)
    );
  }

  private executeQuery(query: AgentQuery): Observable<AgentQueryResult> {
    return this.agentService.getChatQuery(query.chatId).pipe(
      catchError(err => {
        this.patch({error: normalizeError(err)});
        return throwError(() => err);
      }),
      finalize(() => this.patch({loading: false})),
      shareReplay(1)
    );
  }

  private reduce(result: AgentCommandResult) {
    switch (result.type) {
      case 'CreateChatCommandResult':
        // Chat ID and initial message are already handled in createChat
        break;
      case 'SendMessageCommandResult':
        // Message already added optimistically
        break;
    }
  }

  addMessage(message: Message): void {
    const messages = [...this._state.value.messages, message];
    this.patch({messages});
  }

  addAgentMessage(content: string): void {
    const agentMessage: Message = {
      role: 'AGENT',
      content,
      status: 'sent'
    };
    this.addMessage(agentMessage);
    this.setTyping(false);
  }

  updateMessageStatus(message: Message, status: 'sending' | 'sent' | 'error', id?: string): void {
    const messages = this._state.value.messages.map(msg =>
      msg === message ? {...msg, status, ...(id && {id})} : msg
    );
    this.patch({messages});
  }

  setTyping(isTyping: boolean): void {
    this.patch({isTyping});
  }

  updateCurrentUserMessage(content: string): void {
    this.patch({currentUserMessage: content});
  }

  clearError(): void {
    this.patch({error: undefined});
  }

  reset(): void {
    this._state.next({
      messages: [],
      loading: false,
      isTyping: false
    });
  }

  private patch(partial: Partial<ChatState>) {
    this._state.next({...this._state.value, ...partial});
  }

  private simulateAgentResponse(): void {
    setTimeout(() => {
      this.addAgentMessage("Hello! I understand you're a Java Developer. How can I assist you today with your Java development needs?");
    }, 500);
  }
}

function normalizeError(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (typeof e === 'string') return e;
  return 'Unexpected error occurred';
}
