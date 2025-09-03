import {
  AfterViewChecked,
  Component, computed, DestroyRef, ElementRef, inject, OnInit, Signal, signal, ViewChild, WritableSignal
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
export class ChatComponent implements OnInit, AfterViewChecked  {
  readonly router: Router = inject(Router);
  readonly builder: FormBuilder = inject(FormBuilder);
  readonly query: QueryService = inject(QueryService);
  readonly command: CommandService = inject(CommandService);
  readonly destroyRef: DestroyRef = inject(DestroyRef);

  private readonly form = signal<ChatForm>(
    this.builder.nonNullable.group({
      text: ['', [Validators.required, Validators.maxLength(2000)]]
    })
  );

  private readonly error = signal<string | null>(null);
  private readonly chatId = signal<string | null>(null);
  private readonly isLoading = signal<boolean>(false);
  private readonly isSubmitting = signal<boolean>(false);
  private readonly isLineWrapped = signal<boolean>(false);

  private _shouldScrollToBottom: boolean = false;

  viewModel = computed(() => ({
    form: this.form(),
    error: this.error(),
    chatId: this.chatId(),
    isLoading: this.isLoading(),
    isSubmitting: this.isSubmitting(),
    isLineWrapped: this.isLineWrapped()
  }));

  private _messages: WritableSignal<Message[]> = signal<Message[]>([]);
  readonly messages: Signal<Message[]> = this._messages.asReadonly();
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  constructor() {
    const navigation: Navigation | null = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      const result = navigation.extras.state as CreateChatCommandResult;
      this.chatId.set(result.chatId);
      this.handleResult(result);
    }
  }

  ngOnInit(): void {
    const state = this.viewModel();
    if (state.chatId && this._messages().length === 0) {
      this.loadChatHistory();
    }
  }

  ngAfterViewChecked(): void {
    if (this._shouldScrollToBottom) {
      this.scrollToBottom();
      this._shouldScrollToBottom = false;
    }
  }

  sendReply() {
    const state = this.viewModel();
    if (!state.chatId)
      return;
    const text: string = state.form.controls.text.value;
    if (!text || text.length === 0) {
      return;
    }
    console.log(`Send reply to chat: ${this.chatId} with content: ${text}`)
    this.sendChatMessage(state.chatId, text)
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

  addChatMessage(chatId: string, message: Message) {
    this._messages.update(list => [...list, message]);
  }

  getChatQuery(chatId: string): Observable<GetChatQueryResult> {
    const state = this.viewModel();

    if (state.isLoading)
      return EMPTY;

    this.isLoading.set(true)

    return this.query.getChatQuery(new GetChatQuery(chatId))
      .pipe(
        tap((getChatQueryResult: GetChatQueryResult) => {
          this.error.set(null);
          console.log('Chat history loaded:', getChatQueryResult)
        }),
        catchError(err => {
          console.error('Failed to load chat history:', err);
          this.error.set('Failed to load chat history. Please refresh the page.');
          return throwError(() => new Error('Failed to load chat history'));
        }),
        finalize(() => this.isLoading.set(false))
      );
  }

  sendChatMessage(chatId: string, content: string): Observable<SendMessageCommandResult> {
    const state = this.viewModel();

    if (state.isSubmitting)
      return EMPTY;

    this.isSubmitting.set(true);

    const message: Message = {content};

    return this.command.execute(new SendMessageCommand(chatId, message))
      .pipe(
        delay(500),
        map((actionCommandResult: ActionCommandResult) => actionCommandResult as SendMessageCommandResult),
        tap((sendMessageCommandResult: SendMessageCommandResult) => {
          this.error.set(null);
          console.log('Send chat message successfully:', sendMessageCommandResult);
        }),
        finalize(() => {
          this.form().reset();
          this.error.set(null);
          this.isSubmitting.set(false);
          this.isLineWrapped.set(false);
        }),
        catchError((err) => {
          console.error('Send chat message failed:', err);
          this.error.set("Oops! Something went wrong, please try again.");
          return throwError(() => new Error("Send chat message failed"));
        }),
        finalize(() => this.isSubmitting.set(false))
      );
  }

  private handleResult(result: CreateChatCommandResult) {
    this.addChatMessage(result.chatId, result.message);
    this.loadChatHistory();
  }

  private loadChatHistory() {
    const state = this.viewModel();
    if (!state.chatId)
      return;
    console.log('Loading chat history for:', this.chatId);
    this.getChatQuery(state.chatId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result: GetChatQueryResult) => {
          if (result.messages && result.messages.length > 0) {
            this._messages.set(result.messages);
            this._shouldScrollToBottom = true;
          }
          if (result.chatId) {
            this.chatId.set(result.chatId);
          }
        },
        error: (err) => {
          console.error('Error loading chat history:', err);
        }
      });
  }

  private scrollToBottom(): void {
    if (this.messagesContainer) {
      try {
        const element = this.messagesContainer.nativeElement;
        element.scrollTop = element.scrollHeight;
      } catch (err) {
        console.error('Error scrolling to bottom:', err);
      }
    }
  }

  protected readonly Role = Role;
}
