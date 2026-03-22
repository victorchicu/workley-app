import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component, computed, DestroyRef, effect, ElementRef, inject,
  OnDestroy, OnInit, PLATFORM_ID, Signal, signal, ViewChild, WritableSignal
} from '@angular/core';
import {PromptInputFormComponent} from '../prompt/components/prompt-input-form/prompt-input-form.component';
import {Navigation, Router} from '@angular/router';
import {
  PayloadType,
  CreateChatPayload, Message, Role, AddMessage, AddMessagePayload, ErrorCode
} from '../../shared/command/command.models';
import {DatePipe, NgForOf, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault} from '@angular/common';
import {PromptSendButtonComponent} from '../prompt/components/prompt-send-button/prompt-send-button.component';
import {ChatDisclaimerComponent} from './components/chat-disclaimer/chat-disclaimer.component';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {
  bufferTime,
  catchError,
  delay,
  EMPTY,
  filter,
  finalize,
  map,
  Observable,
  Subscription,
  tap,
  throwError
} from 'rxjs';
import {GetChat, GetChatPayload} from '../../shared/query/query.models';
import {QueryService} from '../../shared/query/query.service';
import {CommandService} from '../../shared/command/command.service';
import {RSocketService} from '../../shared/websocket/rsocket.service';
import {MarkdownComponent} from 'ngx-markdown';
import {AsReplyChunkPipe} from '../../shared/pipes/as-reply-chunk.pipe';
import {AsReplyErrorPipe} from '../../shared/pipes/as-reply-error.pipe';

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
    MarkdownComponent,
    NgSwitchDefault,
    NgSwitchCase,
    NgSwitch,
    AsReplyChunkPipe,
    AsReplyErrorPipe,
  ],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatComponent implements OnInit, OnDestroy {
  readonly router: Router = inject(Router);
  readonly builder: FormBuilder = inject(FormBuilder);
  readonly query: QueryService = inject(QueryService);
  readonly command: CommandService = inject(CommandService);
  readonly destroyRef: DestroyRef = inject(DestroyRef);
  readonly rsocketService: RSocketService = inject(RSocketService);

  private readonly form = signal<ChatForm>(
    this.builder.nonNullable.group({
      text: ['', [Validators.required, Validators.maxLength(2000)]]
    })
  );

  private readonly error = signal<string | null>(null);
  private readonly chatId = signal<string | null>(null);
  private readonly isLoading = signal<boolean>(false);
  private readonly isLineWrapped = signal<boolean>(false);
  private readonly isReplyStreaming = signal<boolean>(false);
  private readonly isPromptSubmitting = signal<boolean>(false);

  viewModel = computed(() => {
    const error = this.error();
    const chatId = this.chatId();
    const messages = this._messages();
    const isLoading = this.isLoading();
    const isLineWrapped = this.isLineWrapped();
    const isReplyStreaming = this.isReplyStreaming();
    const isPromptSubmitting = this.isPromptSubmitting();

    const last: Message | null =
      messages.length > 0 ? messages[messages.length - 1] : null;

    const isVisitorWaitingForReply: boolean =
      last?.role === Role.ANONYMOUS && !isReplyStreaming;

    return {
      form: this.form(),
      error,
      chatId,
      isLoading,
      isLineWrapped,
      isReplyStreaming,
      isPromptSubmitting,
      isVisitorWaitingForReply,
    };
  });

  private _messages: WritableSignal<Message[]> = signal<Message[]>([]);
  readonly messages: Signal<Message[]> = this._messages.asReadonly();
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  private streamDebounceTimer?: any;
  private streamSubscription?: Subscription;

  constructor() {
    const navigation: Navigation | null = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      const result = navigation.extras.state as CreateChatPayload;
      this.chatId.set(result.chatId);
      this.createChat(result);
    }
    this.rsocketService.isConnected()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(isConnected => {
        if (isConnected) {
          const chatId: string | null = this.chatId();
          if (chatId && !this.streamSubscription) {
            this.initializeRSocketStream(chatId);
          }
        }
      });
  }

  ngOnInit(): void {

  }

  ngOnDestroy(): void {
    if (this.streamDebounceTimer) {
      clearTimeout(this.streamDebounceTimer);
    }
    if (this.streamSubscription) {
      this.streamSubscription.unsubscribe();
    }
  }

  onAddMessage() {
    const state = this.viewModel();
    if (!state.chatId)
      return;
    const text: string = state.form.controls.text.value;
    if (!text || text.length === 0) {
      return;
    }
    this.isReplyStreaming.set(false);
    this.addChatMessage(state.chatId, text)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (addMessagePayload: AddMessagePayload) => {
          this._messages.update(list => [...list, addMessagePayload.message]);
        },
        error: () => {
          this.router.navigate(['/error'])
            .then(success => {
              if (!success) {
                this.error.set('Navigation failed');
              }
            })
            .catch(err => {
              console.error('Navigation error:', err);
              this.error.set('Navigation failed');
            });
        }
      });
  }

  getChatQuery(chatId: string): Observable<GetChatPayload> {
    const state = this.viewModel();

    if (state.isLoading)
      return EMPTY;

    this.isLoading.set(true)

    return this.query.getChatQuery(new GetChat(chatId))
      .pipe(
        tap((getChatOutput: GetChatPayload) => {
          this.error.set(null);
        }),
        catchError((cause: any) => {
          console.error(cause);
          this.error.set(cause?.error?.message ?? "Failed to load chat history. Please try again later.");
          return EMPTY as Observable<GetChatPayload>;
        }),
        finalize(() => {
          this.isLoading.set(false);
        })
      );
  }

  addChatMessage(chatId: string, text: string): Observable<AddMessagePayload> {
    const state = this.viewModel();

    if (state.isPromptSubmitting)
      return EMPTY;

    this.isPromptSubmitting.set(true);

    const message: Message = {
      content: {
        type: "REPLY_CHUNK",
        text: text
      }
    };

    return this.command.execute(new AddMessage(chatId, message))
      .pipe(
        map((payloadType: PayloadType) => payloadType as AddMessagePayload),
        tap((addMessagePayload: AddMessagePayload) => {
          this.error.set(null);
        }),
        finalize(() => {
          this.form().reset();
          this.error.set(null);
          this.isLineWrapped.set(false);
          this.isPromptSubmitting.set(false);
          requestAnimationFrame(() => this.scrollToBottom());
        }),
        catchError((err) => {
          this.error.set(err.error?.message ?? "Failed to send message. Please try again later.");
          return throwError(() => new Error());
        })
      );
  }

  trackByMessageId(index: number, message: Message): string {
    return message.id || index.toString();
  }

  handleLineWrapChange(isWrapped: boolean): void {
    this.isLineWrapped.set(isWrapped);
  }

  private createChat(result: CreateChatPayload) {
    this._messages.update(list => [...list, result.message]);
    this.loadChatHistory();
  }

  private loadChatHistory() {
    const state = this.viewModel();
    if (!state.chatId)
      return;
    this.getChatQuery(state.chatId)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          requestAnimationFrame(() => this.scrollToBottom());
        })
      )
      .subscribe({
        next: (result: GetChatPayload) => {
          if (result.messages && result.messages.length > 0) {
            this._messages.set(result.messages);
          }
          if (result.chatId) {
            this.chatId.set(result.chatId);
          }
        }
      });
  }

  private scrollToBottom(): void {
    if (this.messagesContainer) {
      try {
        const element = this.messagesContainer.nativeElement;
        element.scrollTo({
          top: element.scrollHeight,
          behavior: 'smooth'
        });
      } catch (err) {
        console.error(err);
      }
    }
  }

  private handleStreamingMessage(source: Message): void {
    if (this.streamDebounceTimer) {
      clearTimeout(this.streamDebounceTimer);
    }
    switch (source.content.type) {
      case "REPLY_CHUNK":
        const chunk: string = source.content.text;
        this.streamDebounceTimer = setTimeout(() => {
          const messages: Message[] = this._messages();
          const existingIndex = messages.findIndex(message => message.id === source.id);
          if (existingIndex !== -1) {
            this._messages.update(list => {
              const updatedList: Message[] = [...list];
              updatedList[existingIndex] = {
                ...updatedList[existingIndex],
                content: {
                  type: "REPLY_CHUNK",
                  text: chunk
                }
              };
              return updatedList;
            });
          } else {
            const message: Message = {
              id: source.id,
              role: Role.ASSISTANT,
              chatId: source.chatId,
              ownedBy: source.ownedBy,
              createdAt: source.createdAt || new Date(),
              content: {
                type: "REPLY_CHUNK",
                text: chunk
              }
            };
            this.isReplyStreaming.set(true);
            this._messages.update(list => [...list, message]);
          }
          requestAnimationFrame(() => {
            if (this.messagesContainer) {
              const element = this.messagesContainer.nativeElement;
              const isNear = element.scrollHeight - element.scrollTop - element.clientHeight < 100;
              if (isNear) {
                element.scrollTo({
                  top: element.scrollHeight,
                  behavior: 'smooth'
                });
              }
            }
          });
        }, 50);
        requestAnimationFrame(() => this.scrollToBottom());
        break;
      case "REPLY_COMPLETED":
        console.log("Reply COMPLETED");
        this.isReplyStreaming.set(false);
        requestAnimationFrame(() => this.scrollToBottom());
        break;
      case "REPLY_ERROR":
        const code: ErrorCode = source.content.code;
        const reason: string = source.content.reason;
        console.log("Reply ERROR");
        this.error.set(reason);
        this.isReplyStreaming.set(false);
        this._messages.update(list => [
          ...list,
          {
            id: source.id,
            role: Role.ASSISTANT,
            ownedBy: source.ownedBy,
            createdAt: source.createdAt || new Date(),
            content: {
              type: "REPLY_ERROR",
              code: code,
              reason: reason
            }
          }
        ]);
        requestAnimationFrame(() => this.scrollToBottom());
        break;
    }
  }

  private initializeRSocketStream(chatId: string): void {
    if (this.streamSubscription) {
      this.streamSubscription.unsubscribe();
    }
    this.streamSubscription = this.rsocketService.streamChat(chatId)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        filter((message: Message) => message.role === Role.ASSISTANT),
        bufferTime(50),
        filter((messages: Message[]) => messages.length > 0),
        map((messages: Message[]) => messages[messages.length - 1])
      )
      .subscribe({
        next: (message: Message) => {
          this.handleStreamingMessage(message);
        },
        error: (error) => {
          console.error('RSocket stream error:', error);
          this.isReplyStreaming.set(false);
        },
        complete: () => {
          this.isReplyStreaming.set(false);
          if (this.streamDebounceTimer) {
            clearTimeout(this.streamDebounceTimer);
          }
        }
      });
  }

  protected readonly Role = Role;
}
