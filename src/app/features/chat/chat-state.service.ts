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
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {PromptForm} from '../prompt/prompt-state.service';

export interface ChatControl {
  text: FormControl<string>;
}

export type ChatForm = FormGroup<ChatControl>;

@Injectable({
  providedIn: 'root'
})
export class ChatState {
  readonly builder: FormBuilder = inject(FormBuilder);
  readonly form: ChatForm = this.builder.nonNullable.group({text: ['', [Validators.required, Validators.maxLength(2000)]]});

  readonly query: QueryService = inject(QueryService);
  readonly command: CommandService = inject(CommandService);
  readonly destroyRef: DestroyRef = inject(DestroyRef);

  private _error: WritableSignal<string | null> = signal<string | null>(null);
  private _messages: WritableSignal<Message[]> = signal<Message[]>([]);
  private _isLoading: WritableSignal<boolean> = signal(false);

  readonly error: Signal<string | null> = this._error.asReadonly();
  readonly messages: Signal<Message[]> = this._messages.asReadonly();
  readonly isLoading: WritableSignal<boolean> = signal(false);
  readonly isSubmitting: WritableSignal<boolean> = signal(false);

  readonly error$: Observable<string | null> = toObservable(this.error);
  readonly messages$: Observable<Message[]> = toObservable(this.messages);

  // Add a message locally (UI or optimistic update)
  addChatMessage(chatId: string, message: Message) {
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

  sendChatMessage(chatId: string, content: string) {
    if (this._isLoading()) return;

    this._isLoading.set(true);
    this._error.set(null);

    const outgoing: Message = {content};

    // Optional: optimistic UI update
    this._messages.update(list => [...list, outgoing]);

    this.command.execute(new SendMessageCommand(chatId, outgoing))
      .pipe(
        delay(500),
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
