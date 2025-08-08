import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Prompt} from '../../features/resume/component/prompt-form/prompt-input/prompt-input.component';
import {Observable} from 'rxjs';
import {Result} from './command/result/result';
import {Command} from './command/command';

@Injectable({
  providedIn: 'root'
})
export class AgentService {

  constructor(private readonly httpClient: HttpClient) {
    //
  }

  executeCommand<T extends Command, R extends Result>(command: T): Observable<R> {
    return this.httpClient.post<R>("/api/agent/command", command, {
      withCredentials: true
    })
  }
}
