import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {
  CommandType,
  PayloadType,
} from '../models/command.models';

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
    });
  }
}
