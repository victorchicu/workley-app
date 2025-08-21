import {inject, Injectable} from '@angular/core';
import {BehaviorSubject, catchError, delay, finalize, map, of, tap} from 'rxjs';
import {
  ActionCommandResult, Message,
  SendMessageCommand,
  SendMessageCommandResult
} from '../../shared/models/command.models';
import {GetChatQueryService} from '../../shared/services/get-chat-query.service';
import {GetChatQuery, GetChatQueryResult} from '../../shared/models/query.models';
import {CommandService} from '../../shared/services/command.service';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {PromptForm} from '../../shared/services/prompt.facade';
@Injectable({
  providedIn: 'root'
})
export class ChatFacade {
  private messagesSubject = new BehaviorSubject<Message[]>([]);
  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);

  readonly messages$ = this.messagesSubject.asObservable();
  readonly isLoading$ = this.isLoadingSubject.asObservable();
  readonly error$ = this.errorSubject.asObservable();

  constructor(private command: CommandService, private getChatQueryService: GetChatQueryService) {
  }

  createChat(chatId: string, message: Message) {
    this.errorSubject.next(null);
    this.messagesSubject.next([message]);
  }

  loadChatHistory(chatId: string) {
    this.isLoadingSubject.next(true);
    this.getChatQueryService.fetch(new GetChatQuery(chatId))
      .pipe(
        tap((history: GetChatQueryResult) => {
          this.messagesSubject.next(history.messages);
          this.errorSubject.next(null);
        }),
        catchError(error => {
          console.error('Failed to load chat history:', error);
          this.errorSubject.next('Failed to load chat history. Please refresh the page.');
          return of({messages: []});
        }),
        finalize(() => this.isLoadingSubject.next(false))
      )
      .subscribe();
  }

  sendMessage(chatId: string, content: string) {
    this.isLoadingSubject.next(true);

    const message: Message = {
      content: content
    }

    this.command.execute(new SendMessageCommand(chatId, message))
      .pipe(
        delay(1000),
        map((result: ActionCommandResult) => result as SendMessageCommandResult),
        tap((response: SendMessageCommandResult) => {
          const currentMessages = this.messagesSubject.value;
          this.messagesSubject.next([...currentMessages, response.message]);
        }),
        catchError(error => {
          console.error('Failed to send message:', error);
          this.errorSubject.next('Failed to send message. Please try again.');
          return of(null);
        }),
        finalize(() => this.isLoadingSubject.next(false))
      )
      .subscribe();
  }

  retryLastMessage(chatId: string) {
    const messages = this.messagesSubject.value;
    const lastUserMessage = [...messages].reverse().find(m => m.actor === 'user');

    if (lastUserMessage) {
      // Remove any failed assistant messages
      const filteredMessages: Message[] = messages.filter(m =>
        !(m.actor === 'assistant'
          // && m.isLoading
        )
      );
      this.messagesSubject.next(filteredMessages);
    }
  }

  clearChat() {
    this.errorSubject.next(null);
    this.messagesSubject.next([]);
  }
}
