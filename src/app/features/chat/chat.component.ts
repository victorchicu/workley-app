import {
  ChangeDetectorRef,
  Component, computed, DestroyRef, ElementRef, inject, NgZone,
  OnDestroy, OnInit, Signal, signal, ViewChild, WritableSignal
} from '@angular/core';
import {PromptInputFormComponent} from '../prompt/components/prompt-input-form/prompt-input-form.component';
import {Navigation, Router} from '@angular/router';
import {
  PayloadType,
  CreateChatPayload, Message, Role, AddMessage, AddMessagePayload
} from '../../shared/models/command.models';
import {DatePipe, NgForOf, NgIf} from '@angular/common';
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
import {GetChat, GetChatPayload} from '../../shared/models/query.models';
import {QueryService} from '../../shared/services/query.service';
import {CommandService} from '../../shared/services/command.service';
import {RSocketService} from '../../shared/services/rsocket.service';
import {MarkdownComponent} from 'ngx-markdown';

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

  ],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css',
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
  private readonly isStreaming = signal<boolean>(false);
  private readonly isSubmitting = signal<boolean>(false);
  private readonly isLineWrapped = signal<boolean>(false);

  viewModel = computed(() => {
    const messages: Message[] = this._messages();
    const last: Message | null = messages.length > 0 ? messages[messages.length - 1] : null;
    const isWaitingForReply: boolean = last?.role === Role.ANONYMOUS && !this.isStreaming();

    return {
      form: this.form(),
      error: this.error(),
      chatId: this.chatId(),
      isLoading: this.isLoading(),
      isStreaming: this.isStreaming(),
      isSubmitting: this.isSubmitting(),
      isLineWrapped: this.isLineWrapped(),
      isWaitingForReply: isWaitingForReply
    };
  });

  private _messages: WritableSignal<Message[]> = signal<Message[]>([]);
  readonly messages: Signal<Message[]> = this._messages.asReadonly();
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  private streamDebounceTimer?: any;
  private streamSubscription?: Subscription;

  constructor(private ngZone: NgZone, private changeDetectorRef: ChangeDetectorRef) {
    const navigation: Navigation | null = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      const result = navigation.extras.state as CreateChatPayload;
      this.chatId.set(result.chatId);
      this.createChat(result);
    }
  }

  ngOnInit(): void {
    const state = this.viewModel();
    if (state.chatId) {
      this.initializeRSocketStream(state.chatId);
    }
    this.rsocketService.isConnected()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(isConnected => {
        if (isConnected && state.chatId && !this.streamSubscription) {
          this.initializeRSocketStream(state.chatId);
        }
      });
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
    this.isStreaming.set(false);
    this.changeDetectorRef.markForCheck();
    this.addChatMessage(state.chatId, text)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (addMessagePayload: AddMessagePayload) => {
          this._messages.update(list => [...list, addMessagePayload.message]);
          this.changeDetectorRef.markForCheck();
        },
        error: () => {
          this.router.navigate(['/error'])
            .then();
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
          this.changeDetectorRef.markForCheck();
        })
      );
  }

  addChatMessage(chatId: string, text: string): Observable<AddMessagePayload> {
    const state = this.viewModel();

    if (state.isSubmitting)
      return EMPTY;

    this.isSubmitting.set(true);
    this.changeDetectorRef.markForCheck();

    const message: Message = {
      content: {
        type: "text",
        value: text
      }
    };

    return this.command.execute(new AddMessage(chatId, message))
      .pipe(
        delay(100),
        map((payloadType: PayloadType) => payloadType as AddMessagePayload),
        tap((addMessagePayload: AddMessagePayload) => {
          this.error.set(null);
        }),
        finalize(() => {
          this.form().reset();
          this.error.set(null);
          this.isSubmitting.set(false);
          this.isLineWrapped.set(false);
          this.changeDetectorRef.markForCheck();
          requestAnimationFrame(() => this.scrollToBottom());
        }),
        catchError((err) => {
          this.error.set(err.error?.message ?? "Failed to send message. Please try again later.");
          this.changeDetectorRef.markForCheck();
          return throwError(() => new Error());
        })
      );
  }

  trackByMessageId(index: number, message: Message): string {
    return message.id || index.toString();
  }

  handleLineWrapChange(isWrapped: boolean): void {
    this.isLineWrapped.set(isWrapped);
    this.changeDetectorRef.markForCheck();
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
          this.changeDetectorRef.markForCheck();
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
          this.changeDetectorRef.markForCheck();
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

    const streamBuffer: string = source.content.value;

    // Debounce updates to reduce flickering
    this.streamDebounceTimer = setTimeout(() => {
      this.ngZone.run(() => {
        const messages: Message[] = this._messages();
        const existingIndex = messages.findIndex(message => message.id === source.id);
        if (existingIndex !== -1) {
          this._messages.update(list => {
            const updatedList: Message[] = [...list];
            updatedList[existingIndex] = {
              ...updatedList[existingIndex],
              content: {
                type: "text",
                value: streamBuffer
              }
            };
            return updatedList;
          });
        } else {
          const message: Message = {
            id: source.id,
            chatId: source.chatId,
            ownedBy: source.ownedBy,
            role: Role.ASSISTANT,
            createdAt: source.createdAt || new Date(),
            content: {
              type: "text",
              value: streamBuffer
            }
          };
          this.isStreaming.set(true);
          this._messages.update(list => [...list, message]);
        }
        this.changeDetectorRef.markForCheck();
        requestAnimationFrame(() => {
          if (this.messagesContainer) {
            const element = this.messagesContainer.nativeElement;
            const isNearBottom = element.scrollHeight - element.scrollTop - element.clientHeight < 100;
            if (isNearBottom) {
              element.scrollTo({
                top: element.scrollHeight,
                behavior: 'smooth'
              });
            }
          }
        });
      });
    }, 50); // 50ms debounce for smooth updates
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
          this.isStreaming.set(false);
          this.changeDetectorRef.markForCheck();
        },
        complete: () => {
          this.isStreaming.set(false);
          if (this.streamDebounceTimer) {
            clearTimeout(this.streamDebounceTimer);
          }
          this.changeDetectorRef.markForCheck();
        }
      });
  }

  protected readonly Role = Role;
}
