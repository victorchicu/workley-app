import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {retry} from 'rxjs/operators';
import {retryStrategy} from '../idempotency/retry-strategy';
import {
  CreateChatResponse,
  AddMessageResponse,
  GetChatResponse
} from './chat-api.models';

@Injectable({providedIn: 'root'})
export class ChatApiService {
  private readonly baseUrl = '/api/chats';

  constructor(private readonly httpClient: HttpClient) {}

  createChat(prompt: string): Observable<CreateChatResponse> {
    return this.httpClient.post<CreateChatResponse>(this.baseUrl, {prompt}, {
      withCredentials: true
    }).pipe(retry(retryStrategy()));
  }

  addMessage(chatId: string, text: string): Observable<AddMessageResponse> {
    return this.httpClient.post<AddMessageResponse>(`${this.baseUrl}/${chatId}/messages`, {text}, {
      withCredentials: true
    }).pipe(retry(retryStrategy()));
  }

  getChat(chatId: string): Observable<GetChatResponse> {
    return this.httpClient.get<GetChatResponse>(`${this.baseUrl}/${chatId}`, {
      withCredentials: true
    });
  }
}
