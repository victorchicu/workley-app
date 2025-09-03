import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {GetChatQueryResult, GetQuery, GetQueryResult} from '../models/query.models';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class QueryService {

  readonly baseUrl: string = '/api/chats';

  constructor(private readonly httpClient: HttpClient) {
  }

  public getChatQuery(query: GetQuery): Observable<GetChatQueryResult> {
    return this.httpClient.get<GetQueryResult>(`${this.baseUrl}/${query.chatId}`, {
      withCredentials: true,
    })
  }
}
