import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {GetChatResult, ActionQuery, ActionQueryResult} from '../models/query.models';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class QueryService {

  readonly baseUrl: string = '/api/chats';

  constructor(private readonly httpClient: HttpClient) {
  }

  public getChatQuery(query: ActionQuery): Observable<GetChatResult> {
    return this.httpClient.get<ActionQueryResult>(`${this.baseUrl}/${query.chatId}`, {
      withCredentials: true,
    })
  }
}
