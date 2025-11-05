import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {GetChatPayload, QueryType, PayloadType} from '../models/query.models';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class QueryService {

  readonly baseUrl: string = '/api/chats';

  constructor(private readonly httpClient: HttpClient) {
  }

  public getChatQuery(query: QueryType): Observable<GetChatPayload> {
    return this.httpClient.get<PayloadType>(`${this.baseUrl}/${query.chatId}`, {
      withCredentials: true,
    })
  }
}
