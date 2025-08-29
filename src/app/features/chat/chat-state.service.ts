import {computed, DestroyRef, inject, Injectable, Signal, signal, WritableSignal} from '@angular/core';
import {BehaviorSubject, catchError, delay, finalize, map, Observable, of, tap, throwError} from 'rxjs';
import {
  ActionCommandResult, Message,
  SendMessageCommand,
  SendMessageCommandResult
} from '../../shared/models/command.models';
import {QueryService} from '../../shared/services/query.service';
import {GetChatQuery, GetChatQueryResult} from '../../shared/models/query.models';
import {CommandService} from '../../shared/services/command.service';
import {takeUntilDestroyed, toObservable} from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root'
})
export class ChatState {
  private readonly query: QueryService = inject(QueryService);
  private readonly command: CommandService = inject(CommandService);
  private readonly destroyRef: DestroyRef = inject(DestroyRef);

  private readonly _error: WritableSignal<string | null> = signal<string | null>(null);
  private readonly _messages: WritableSignal<Message[]> = signal<Message[]>([]);
  private readonly _isLoading: WritableSignal<boolean> = signal(false);

  readonly error: Signal<string | null> = this._error.asReadonly();
  readonly messages: Signal<Message[]> = this._messages.asReadonly();
  readonly isLoading: Signal<boolean> = this._isLoading.asReadonly();

  readonly canSend: Signal<boolean> = computed(() => !this._isLoading());
  readonly hasMessages: Signal<boolean> = computed(() => this._messages().length > 0);

  readonly error$: Observable<string | null> = toObservable(this.error);
  readonly messages$: Observable<Message[]> = toObservable(this.messages);
  readonly isLoading$: Observable<boolean> = toObservable(this.isLoading);


  // Add a message locally (UI or optimistic update)
  addMessage(chatId: string, message: Message) {
    // NOTE: your original code replaced the list with `[message]`.
    // If you really intend that, replace update(...) with set([message]).
    this._messages.update(list => [...list, message]);
  }

  loadChatHistory(chatId: string) {
    this._isLoading.set(true);
    this.query
      .fetchChat(new GetChatQuery(chatId))
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        tap((history: GetChatQueryResult) => {
          this._messages.set(history.messages ?? []);
          this._error.set(null);
        }),
        catchError(err => {
          console.error('Failed to load chat history:', err);
          this._error.set('Failed to load chat history. Please refresh the page.');
          this._messages.set([]);
          return throwError(() => new Error('Oops! Something went wrong, please try again.'));
        }),
        finalize(() => this._isLoading.set(false))
      )
      .subscribe();
  }

  sendMessage(chatId: string, content: string) {
    if (this._isLoading()) return;

    this._isLoading.set(true);
    this._error.set(null);

    const outgoing: Message = {content};

    // Optional: optimistic UI update
    this._messages.update(list => [...list, outgoing]);

    this.command
      .execute(new SendMessageCommand(chatId, outgoing))
      .pipe(
        delay(1000), // keep if you want the same UX feel
        map((r: ActionCommandResult) => r as SendMessageCommandResult),
        tap((response: SendMessageCommandResult) => {
          // Replace the optimistic item with the server message if needed
          // For now, just append server message:
          this._messages.update(list => [...list, response.message]);
        }),
        catchError(err => {
          console.error('Failed to send message:', err);
          this._error.set('Failed to send message. Please try again.');
          // Optional: rollback optimistic message
          this._messages.update(list => {
            const idx = list.lastIndexOf(outgoing);
            return idx >= 0 ? list.slice(0, idx).concat(list.slice(idx + 1)) : list;
          });
          return of(null);
        }),
        finalize(() => this._isLoading.set(false))
      )
      .subscribe();
  }
}
