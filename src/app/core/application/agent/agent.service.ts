import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, catchError, finalize, Observable, shareReplay, tap, throwError} from 'rxjs';
import {
  AgentCommand, AgentResult,
  ChatState
} from './agent.models';

@Injectable({
  providedIn: 'root'
})
export class AgentService {
  readonly apiBaseUrl: string = '/api';
  private readonly _state: BehaviorSubject<ChatState> = new BehaviorSubject<ChatState>({
    messages: [],
    loading: false,
  });

  readonly state$: Observable<ChatState> = this._state.asObservable().pipe(shareReplay(1));

  constructor(private readonly httpClient: HttpClient) {

  }

  executeCommand(command: AgentCommand): Observable<AgentResult> {
    this.patch({loading: true, error: undefined});
    const request$: Observable<AgentResult> = this.post(command);
    return request$.pipe(
      tap((result: AgentResult) => this.reduce(result)),
      catchError(err => {
        this.patch({error: normalizeError(err)});
        return throwError(() => err);
      }),
      finalize(() => this.patch({loading: false})),
      shareReplay(1)
    );
  }

  private post(command: AgentCommand): Observable<AgentResult> {
    return this.httpClient.post<AgentResult>(`${this.apiBaseUrl}/agent/command`, command, {
      withCredentials: true
    })
  }

  private reduce(result: AgentResult) {
    const prev: ChatState = this._state.value;


  }

  private patch(partial: Partial<ChatState>) {
    this._state.next({...this._state.value, ...partial});
  }
}

function normalizeError(e: unknown): string {
  return e instanceof Error ? e.message : 'Unexpected error';
}
