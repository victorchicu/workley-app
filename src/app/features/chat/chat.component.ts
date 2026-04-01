import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component, computed, DestroyRef, effect, ElementRef, inject,
  OnDestroy, OnInit, Signal, signal, ViewChild, WritableSignal
} from '@angular/core';
import {PromptInputFormComponent} from '../prompt/components/prompt-input-form/prompt-input-form.component';
import {ActivatedRoute, Navigation, Router} from '@angular/router';
import {
  Role, Message, Attachment, ErrorCode, CreateChatResponse, AddMessageResponse, GetChatResponse
} from '../../shared/chat-api/chat-api.models';
import {ChatApiService} from '../../shared/chat-api/chat-api.service';
import {DatePipe, NgForOf, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault} from '@angular/common';
import {PromptSendButtonComponent} from '../prompt/components/prompt-send-button/prompt-send-button.component';
import {ChatDisclaimerComponent} from './components/chat-disclaimer/chat-disclaimer.component';
import {takeUntilDestroyed, toObservable} from '@angular/core/rxjs-interop';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {
  bufferTime,
  catchError,
  EMPTY,
  filter,
  finalize,
  Observable,
  Subscription,
  tap,
  throwError
} from 'rxjs';
import {RSocketService} from '../../shared/websocket/rsocket.service';
import {MarkdownComponent} from 'ngx-markdown';
import {AsReplyChunkPipe} from '../../shared/pipes/as-reply-chunk.pipe';
import {AsReplyErrorPipe} from '../../shared/pipes/as-reply-error.pipe';
import {PromptActionsMenuComponent} from '../prompt/components/prompt-actions-menu/prompt-actions-menu.component';
import {AttachmentApiService} from '../../shared/chat-api/attachment-api.service';
import {AttachmentUploadState} from '../../shared/chat-api/attachment-api.models';
import {AttachmentCardComponent} from '../prompt/components/attachment-card/attachment-card.component';
import {PdfPreviewDialogComponent} from './components/pdf-preview-dialog/pdf-preview-dialog.component';

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
    NgForOf,
    PromptSendButtonComponent,
    ChatDisclaimerComponent,
    MarkdownComponent,
    NgSwitchDefault,
    NgSwitchCase,
    NgSwitch,
    AsReplyChunkPipe,
    AsReplyErrorPipe,
    PromptActionsMenuComponent,
    AttachmentCardComponent,
    PdfPreviewDialogComponent,
  ],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatComponent implements OnInit, OnDestroy {
  readonly router: Router = inject(Router);
  readonly builder: FormBuilder = inject(FormBuilder);
  readonly chatApi: ChatApiService = inject(ChatApiService);
  readonly destroyRef: DestroyRef = inject(DestroyRef);
  readonly route: ActivatedRoute = inject(ActivatedRoute);
  readonly rsocketService: RSocketService = inject(RSocketService);
  readonly attachmentApi: AttachmentApiService = inject(AttachmentApiService);

  private readonly form = signal<ChatForm>(
    this.builder.nonNullable.group({
      text: ['', [Validators.required, Validators.maxLength(2000)]]
    })
  );

  private readonly error = signal<string | null>(null);
  private readonly chatId = signal<string | null>(null);
  private readonly isLoading = signal<boolean>(false);
  private readonly showLoadingSpinner = signal<boolean>(false);
  private readonly isLineWrapped = signal<boolean>(false);
  private readonly isReplyStreaming = signal<boolean>(false);
  private readonly isPromptSubmitting = signal<boolean>(false);

  private readonly isWaitingForReply = signal<boolean>(false);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly attachment = signal<AttachmentUploadState | null>(null);
  readonly hasAttachment = computed(() => !!this.attachment()?.attachmentId);
  readonly pdfPreview = signal<{filename: string; downloadUrl: string} | null>(null);

  private readonly attachmentSub = toObservable(this.hasAttachment)
    .pipe(takeUntilDestroyed())
    .subscribe(() => this.cdr.markForCheck());
  private loadingDelayTimer?: any;

  private readonly loadingEffect = effect(() => {
    const loading = this.isLoading();
    if (loading) {
      this.loadingDelayTimer = setTimeout(() => this.showLoadingSpinner.set(true), 300);
    } else {
      clearTimeout(this.loadingDelayTimer);
      this.showLoadingSpinner.set(false);
    }
  });

  viewModel = computed(() => {
    const error = this.error();
    const chatId = this.chatId();
    const showLoadingSpinner = this.showLoadingSpinner();
    const isLineWrapped = this.isLineWrapped();
    const isReplyStreaming = this.isReplyStreaming();
    const isPromptSubmitting = this.isPromptSubmitting();
    const isWaitingForReply = this.isWaitingForReply();
    const attachment = this.attachment();

    return {
      form: this.form(),
      error,
      chatId,
      isLoading: showLoadingSpinner,
      isLineWrapped,
      isReplyStreaming,
      isPromptSubmitting,
      isVisitorWaitingForReply: isWaitingForReply,
      attachment,
    };
  });

  private _messages: WritableSignal<Message[]> = signal<Message[]>([]);
  readonly messages: Signal<Message[]> = this._messages.asReadonly();
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  private streamSubscription?: Subscription;

  constructor() {
    const navigation: Navigation | null = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      const result = navigation.extras.state as CreateChatResponse;
      this.chatId.set(result.chatId);
      this.createChat(result);
    } else {
      const routeChatId = this.route.snapshot.paramMap.get('chatId');
      if (routeChatId) {
        this.chatId.set(routeChatId);
        this.loadChatHistory();
      }
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
    clearTimeout(this.loadingDelayTimer);
    if (this.streamSubscription) {
      this.streamSubscription.unsubscribe();
    }
  }

  onAddMessage() {
    const state = this.viewModel();
    if (!state.chatId)
      return;
    const text: string = state.form.controls.text.value;
    const hasAttachment = !!this.attachment()?.attachmentId;
    if ((!text || text.length === 0) && !hasAttachment) {
      return;
    }
    const pendingAttachment = this.attachment();
    this.isReplyStreaming.set(false);
    this.isWaitingForReply.set(true);
    this.addChatMessage(state.chatId, text)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: AddMessageResponse) => {
          this._messages.update(list => {
            const updated = [...list];
            if (pendingAttachment?.attachmentId) {
              const attachmentMessage: Message = {
                id: response.message.id + '-att',
                role: response.message.role,
                chatId: response.message.chatId,
                ownedBy: response.message.ownedBy,
                createdAt: response.message.createdAt,
                content: {
                  type: 'ATTACHMENT',
                  attachmentId: pendingAttachment.attachmentId,
                  filename: pendingAttachment.filename,
                  mimeType: pendingAttachment.mimeType,
                  fileSize: pendingAttachment.fileSize,
                } as Attachment
              };
              updated.push(attachmentMessage);
            }
            if (text && text.length > 0) {
              updated.push(response.message);
            }
            return updated;
          });
        },
        error: () => {
          this.isWaitingForReply.set(false);
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

  getChatQuery(chatId: string): Observable<GetChatResponse> {
    const state = this.viewModel();

    if (state.isLoading)
      return EMPTY;

    this.isLoading.set(true)

    return this.chatApi.getChat(chatId)
      .pipe(
        tap(() => {
          this.error.set(null);
        }),
        catchError((cause: any) => {
          console.error(cause);
          this.error.set(cause?.error?.message ?? "Failed to load chat history. Please try again later.");
          return EMPTY as Observable<GetChatResponse>;
        }),
        finalize(() => {
          this.isLoading.set(false);
        })
      );
  }

  addChatMessage(chatId: string, text: string): Observable<AddMessageResponse> {
    const state = this.viewModel();

    if (state.isPromptSubmitting)
      return EMPTY;

    this.isPromptSubmitting.set(true);

    const attachmentId = this.attachment()?.attachmentId ?? undefined;
    return this.chatApi.addMessage(chatId, text, attachmentId)
      .pipe(
        tap(() => {
          this.error.set(null);
        }),
        finalize(() => {
          this.form().reset();
          this.error.set(null);
          this.isLineWrapped.set(false);
          this.isPromptSubmitting.set(false);
          this.attachment.set(null);
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

  private createChat(result: CreateChatResponse) {
    if (this.hasMessageText(result.message)) {
      this._messages.update(list => [...list, result.message]);
    }
    this.isWaitingForReply.set(true);
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
          requestAnimationFrame(() => this.scrollToBottom('instant'));
        })
      )
      .subscribe({
        next: (result: GetChatResponse) => {
          if (result.messages && result.messages.length > 0) {
            this._messages.set(result.messages.filter(m => m.role === Role.ASSISTANT || m.content.type === 'ATTACHMENT' || this.hasMessageText(m)));
            const lastMessage = result.messages[result.messages.length - 1];
            if (lastMessage?.role === Role.ASSISTANT) {
              this.isWaitingForReply.set(false);
            }
          }
          if (result.chatId) {
            this.chatId.set(result.chatId);
          }
        }
      });
  }

  private hasMessageText(message: Message): boolean {
    return message.content.type === 'REPLY_CHUNK' && !!(message.content as any).text;
  }

  private scrollToBottom(behavior: ScrollBehavior = 'smooth'): void {
    try {
      const main = document.querySelector('main');
      if (main) {
        main.scrollTo({
          top: main.scrollHeight,
          behavior
        });
      }
    } catch (err) {
      console.error(err);
    }
  }

  private isNearBottom(): boolean {
    const main = document.querySelector('main');
    if (!main) return false;
    return main.scrollHeight - main.scrollTop - main.clientHeight < 150;
  }

  private handleStreamingMessage(source: Message): void {
    switch (source.content.type) {
      case "REPLY_CHUNK":
        const chunk: string = source.content.text;
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
          this.isWaitingForReply.set(false);
          this._messages.update(list => [...list, message]);
        }
        break;
      case "REPLY_COMPLETED":
        console.log("Reply COMPLETED");
        this.isReplyStreaming.set(false);
        this.isWaitingForReply.set(false);
        break;
      case "REPLY_ERROR":
        const code: ErrorCode = source.content.code;
        const reason: string = source.content.reason;
        console.log("Reply ERROR");
        this.error.set(reason);
        this.isReplyStreaming.set(false);
        this.isWaitingForReply.set(false);
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
      )
      .subscribe({
        next: (messages: Message[]) => {
          const lastChunk = messages.filter(m => m.content.type === 'REPLY_CHUNK').pop();
          const signals = messages.filter(m => m.content.type !== 'REPLY_CHUNK');
          if (lastChunk) this.handleStreamingMessage(lastChunk);
          signals.forEach(s => this.handleStreamingMessage(s));
        },
        error: (error) => {
          console.error('RSocket stream error:', error);
          this.isReplyStreaming.set(false);
        },
        complete: () => {
          this.isReplyStreaming.set(false);
        }
      });
  }

  onFileSelected(file: File): void {
    this.attachment.set({
      status: 'uploading',
      progress: 0,
      attachmentId: null,
      filename: file.name,
      mimeType: file.type,
      fileSize: file.size,
      errorMessage: null,
    });

    this.attachmentApi.upload(file)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (state) => this.attachment.set(state),
        error: (err) => this.attachment.set({
          ...this.attachment()!,
          status: 'error',
          errorMessage: err?.error?.message ?? 'Upload failed',
        }),
      });
  }

  onRemoveAttachment(): void {
    const att = this.attachment();
    if (att?.attachmentId) {
      this.attachmentApi.delete(att.attachmentId)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe();
    }
    this.attachment.set(null);
  }

  onAttachmentCardClicked(attachmentId: string, filename: string, mimeType: string): void {
    if (mimeType === 'application/pdf') {
      this.pdfPreview.set({
        filename,
        downloadUrl: this.attachmentApi.getDownloadUrl(attachmentId),
      });
    } else {
      window.open(this.attachmentApi.getDownloadUrl(attachmentId), '_blank');
    }
  }

  closePdfPreview(): void {
    this.pdfPreview.set(null);
  }

  protected readonly Role = Role;
}
