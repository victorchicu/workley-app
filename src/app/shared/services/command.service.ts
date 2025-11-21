import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable, retry} from 'rxjs';
import {
  CommandType,
  PayloadType,
} from '../models/command.models';
import {v4 as uuidv4} from 'uuid';
import {retryStrategy} from '../idempotency/retry-strategy';

@Injectable({
  providedIn: 'root'
})
export class CommandService {

  readonly apiBaseUrl: string = '/api/command';

  constructor(private readonly httpClient: HttpClient) {
  }

  public execute(command: CommandType): Observable<PayloadType> {
    const idempotencyKey = uuidv4();

    const headers = new HttpHeaders({
      'Idempotency-Key': idempotencyKey
    });

    const observable: Observable<PayloadType> = this.httpClient.post<PayloadType>(this.apiBaseUrl, command, {
      headers: headers,
      withCredentials: true
    });

    return observable.pipe(
      retry(retryStrategy())
    );
  }
}
