import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {GetQuery, GetQueryResult} from '../models/agent.models';

@Injectable({
  providedIn: 'root'
})
export class GetChatQueryService {

  readonly apiBaseUrl: string = '/api/chats';

  constructor(private readonly httpClient: HttpClient) {
  }

  public fetch(query: GetQuery) {
    return this.httpClient.get<GetQueryResult>(`${this.apiBaseUrl}/${query.chatId}`, {
      withCredentials: true,
    })
  }
}
