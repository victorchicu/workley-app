import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {
  CommandInputType,
  CommandOutputType,
} from '../models/command.models';

@Injectable({
  providedIn: 'root'
})
export class CommandService {

  readonly apiBaseUrl: string = '/api/command';

  constructor(private readonly httpClient: HttpClient) {
  }

  public execute(command: CommandInputType): Observable<CommandOutputType> {
    return this.httpClient.post<CommandOutputType>(this.apiBaseUrl, command, {
      withCredentials: true
    });
  }
}
