import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {
  ActionCommand,
  ActionCommandResult,
} from '../models/command.models';

@Injectable({
  providedIn: 'root'
})
export class CommandService {

  readonly apiBaseUrl: string = '/api/command';

  constructor(private readonly httpClient: HttpClient) {
  }

  public execute(command: ActionCommand): Observable<ActionCommandResult> {
    return this.httpClient.post<ActionCommandResult>(this.apiBaseUrl, command, {
      withCredentials: true
    });
  }
}
