import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Command} from './command/command';
import {CommandResult} from './command/result/command-result';

@Injectable({
  providedIn: 'root'
})
export class AgentService {

  constructor(private readonly httpClient: HttpClient) {
    //
  }

  executeCommand<T extends Command, R extends CommandResult>(command: T): Observable<R> {
    return this.httpClient.post<R>("/api/agent/command", command, {
      withCredentials: true
    })
  }
}
