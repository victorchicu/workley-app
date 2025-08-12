import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {
  AgentCommand,
  AgentCommandResult, AgentQueryResult,
} from './agent.models';

@Injectable({
  providedIn: 'root'
})
export class AgentService {

  readonly apiBaseUrl: string = '/api';

  constructor(private readonly httpClient: HttpClient) {
  }

  public executeCommand(command: AgentCommand): Observable<AgentCommandResult> {
    return this.httpClient.post<AgentCommandResult>(`${this.apiBaseUrl}/agent/command`, command, {
      withCredentials: true
    });
  }

  public getChatQuery(chatId: string) {
    return this.httpClient.post<AgentQueryResult>(`${this.apiBaseUrl}/agent/chats/{chatId}`, chatId, {
      withCredentials: true
    })
  }
}
