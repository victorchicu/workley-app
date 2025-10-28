import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {GetChatOutput, QueryInputType, QueryOutputType} from '../models/query.models';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class QueryService {

  readonly baseUrl: string = '/api/chats';

  constructor(private readonly httpClient: HttpClient) {
  }

  public getChatQuery(query: QueryInputType): Observable<GetChatOutput> {
    return this.httpClient.get<QueryOutputType>(`${this.baseUrl}/${query.chatId}`, {
      withCredentials: true,
    })
  }
}
