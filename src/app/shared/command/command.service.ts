import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, retry} from 'rxjs';
import {
  CommandType,
  PayloadType,
} from './command.models';
import {retryStrategy} from '../idempotency/retry-strategy';

@Injectable({
  providedIn: 'root'
})
export class CommandService {

  readonly apiBaseUrl: string = '/api/command';

  constructor(private readonly httpClient: HttpClient) {
  }

  public execute(command: CommandType): Observable<PayloadType> {
    return this.httpClient.post<PayloadType>(this.apiBaseUrl, command, {
      withCredentials: true
    }).pipe(
      retry(retryStrategy())
    );
  }
}
