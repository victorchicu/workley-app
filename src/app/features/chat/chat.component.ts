import {
  Component, computed, DestroyRef, ElementRef, inject, Signal, signal, ViewChild, WritableSignal
} from '@angular/core';
import {PromptInputFormComponent} from '../prompt/components/prompt-input-form/prompt-input-form.component';
import {Navigation, Router} from '@angular/router';
import {
  ActionCommandResult,
  CreateChatCommandResult, Message, Role, SendMessageCommand, SendMessageCommandResult
} from '../../shared/models/command.models';
import {DatePipe, NgForOf, NgIf} from '@angular/common';
import {PromptSendButtonComponent} from '../prompt/components/prompt-send-button/prompt-send-button.component';
import {ChatDisclaimerComponent} from './components/chat-disclaimer/chat-disclaimer.component';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {catchError, delay, EMPTY, finalize, map, Observable, tap, throwError} from 'rxjs';
import {GetChatQuery, GetChatQueryResult} from '../../shared/models/query.models';
import {QueryService} from '../../shared/services/query.service';
import {CommandService} from '../../shared/services/command.service';

export interface ChatControl {
  text: FormControl<string>;
}

export type ChatForm = FormGroup<ChatControl>;

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    PromptInputFormComponent,
    NgIf,
    DatePipe,
    NgForOf,
    PromptSendButtonComponent,
    ChatDisclaimerComponent,
  ],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css',
})
export class ChatComponent {
  readonly builder: FormBuilder = inject(FormBuilder);
  private readonly _form: ChatForm = this.builder.nonNullable.group({text: ['', [Validators.required, Validators.maxLength(2000)]]});

  readonly router: Router = inject(Router);
  readonly query: QueryService = inject(QueryService);
  readonly command: CommandService = inject(CommandService);
  readonly destroyRef: DestroyRef = inject(DestroyRef);

  private _error: string | null = null;
  private _chatId: string | null = null;
  private _isLoading: boolean = false;
  private _isSubmitting: boolean = false;
  private _isLineWrapped: boolean = false;

  viewModel = computed(() => ({
    form: this._form,
    error: this._error,
    isLoading: this._isLoading,
    isSubmitting: this._isSubmitting,
    isLineWrapped: this._isLineWrapped
  }));

  private _messages: WritableSignal<Message[]> = signal<Message[]>([]);
  readonly messages: Signal<Message[]> = this._messages.asReadonly();
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  constructor() {
    const navigation: Navigation | null = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      const result = navigation.extras.state as CreateChatCommandResult;
      console.log("CreateChatCommandResult: ", result);
      this.handleResult(result);
      this._chatId = result.chatId;
    }
  }

  sendReply() {
    if (!this._chatId)
      return;
    const text: string = this._form.controls.text.value;
    if (!text || text.length === 0) {
      return;
    }
    console.log(`Send reply to chat: ${this._chatId} with content: ${text}`)
    this.sendChatMessage(this._chatId, text)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (sendMessageCommandResult: SendMessageCommandResult) => {
          console.log(`SendMessageCommandResult: ${sendMessageCommandResult}`)
          this.addChatMessage(sendMessageCommandResult.chatId, sendMessageCommandResult.message);
        },
        error: (cause) => {
          console.error("Send reply failed:", cause);
          this.router.navigate(['/error'])
            .then();
        }
      });
  }

  // Add a message locally (UI or optimistic update)
  addChatMessage(chatId: string, message: Message) {
    // NOTE: your original code replaced the list with `[message]`.
    // If you really intend that, replace update(...) with set([message]).
    this._messages.update(list => [...list, message]);
  }

  getChatQuery(chatId: string): Observable<GetChatQueryResult> {
    if (this._isLoading)
      return EMPTY;

    this._isLoading = true;

    return this.query.getChatQuery(new GetChatQuery(chatId))
      .pipe(
        tap((getChatQueryResult: GetChatQueryResult) => {
          this._error = null;
        }),
        catchError(err => {
          this._error = 'Failed to load chat history. Please refresh the page.';
          return throwError(() => new Error('Failed to load chat history. Please refresh the page.'));
        }),
        finalize(() => this._isLoading = false)
      );
  }

  sendChatMessage(chatId: string, content: string): Observable<SendMessageCommandResult> {
    if (this._isSubmitting)
      return EMPTY;

    this._isSubmitting = true;

    const message: Message = {content};

    return this.command.execute(new SendMessageCommand(chatId, message))
      .pipe(
        delay(500),
        map((actionCommandResult: ActionCommandResult) => actionCommandResult as SendMessageCommandResult),
        tap((sendMessageCommandResult: SendMessageCommandResult) => {
          this._error = null;
        }),
        finalize(() => {
          this._error = null;
          this._isSubmitting = false;
          this._isLineWrapped = false;
        }),
        catchError((err) => {
          this._error = "Oops! Something went wrong, please try again.";
          return throwError(() => new Error("Send chat message failed"));
        }),
        finalize(() => this._isSubmitting = false)
      );
  }

  private handleResult(result: CreateChatCommandResult) {
    this.addChatMessage(result.chatId, result.message);
    // Optionally fetch full history to ensure consistency
    // this.loadChatHistory();
  }

  private loadChatHistory() {
    if (!this._chatId) return;
    console.log('Loading chat history for:', this._chatId);
    return this.getChatQuery(this._chatId);
  }

  private scrollToBottom(): void {
    if (this.messagesContainer) {
      const element = this.messagesContainer.nativeElement;
      element.scrollTop = element.scrollHeight;
    }
  }

  protected readonly Role = Role;
}
