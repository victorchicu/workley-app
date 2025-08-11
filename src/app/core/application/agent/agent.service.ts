import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Observable, tap} from 'rxjs';
import {Command} from './command/command';
import {CommandResult} from './command/command-result';
import {Message} from '../../../features/resume/component/agent-chat/objects/message';
import {SendMessageCommand} from './command/send-message-command';
import {SendMessageCommandResult} from './command/send-message-command-result';
import {GetChatHistoryQuery} from './query/get-chat-history-query';
import {GetChatHistoryQueryResult} from './query/get-chat-history-query-result';

@Injectable({
  providedIn: 'root'
})
export class AgentService {
  readonly apiBaseUrl: string = '/api';

  private messagesSubject: BehaviorSubject<Message[]> = new BehaviorSubject<Message[]>([]);
  public messages$: Observable<Message[]> = this.messagesSubject.asObservable();

  constructor(private readonly httpClient: HttpClient) {
    //
  }

  executeCommand<T extends Command, R extends CommandResult>(command: T): Observable<R> {
    return this.httpClient.post<R>(`${this.apiBaseUrl}/agent/command`, command, {
      withCredentials: true
    })
  }

  getChatHistoryQuery(query: GetChatHistoryQuery): Observable<GetChatHistoryQueryResult> {
    return this.httpClient.get<GetChatHistoryQueryResult>(
      `${this.apiBaseUrl}/agent/chats/${query.chatId}`
    ).pipe(
      tap(result => {
        this.messagesSubject.next(result.data);
      })
    );
  }

  // Command: Send message
  sendMessage(command: SendMessageCommand): Observable<SendMessageCommandResult> {
    return this.httpClient.post<SendMessageCommandResult>(
      `${this.apiBaseUrl}/chat/${command.chatId}/messages`,
      {content: command.content}
    ).pipe(
      tap(result => {
        const currentMessages = this.messagesSubject.value;
        this.messagesSubject.next([
          ...currentMessages,
          result.message,
          result.reply
        ]);
      })
    );
  }

  // Add a message optimistically (for immediate UI feedback)
  addOptimisticMessage(message: Message): void {
    const currentMessages = this.messagesSubject.value;
    this.messagesSubject.next([...currentMessages, message]);
  }

  // Update message status
  updateMessageStatus(messageId: string, status: 'sending' | 'sent' | 'error'): void {
    const currentMessages = this.messagesSubject.value;
    const updatedMessages = currentMessages.map(msg =>
      msg.id === messageId ? {...msg, status} : msg
    );
    this.messagesSubject.next(updatedMessages);
  }

  // Clear messages
  clearMessages(): void {
    this.messagesSubject.next([]);
  }
}
