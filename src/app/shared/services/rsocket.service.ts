import {Injectable, OnDestroy} from '@angular/core';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {Message} from '../models/command.models';
import {Flowable} from 'rsocket-flowable';
import {
  BufferEncoders,
  encodeCompositeMetadata,
  encodeRoute,
  MESSAGE_RSOCKET_COMPOSITE_METADATA,
  MESSAGE_RSOCKET_ROUTING,
  RSocketClient
} from 'rsocket-core';
import RSocketWebSocketClient from 'rsocket-websocket-client';

type Data = Buffer;
type Metadata = Buffer;

interface Payload<D = Data, M = Metadata> {
  data?: D;
  metadata?: M;
}

interface ReactiveSocket<D = Data, M = Metadata> {
  requestStream(payload: Payload<D, M>): Flowable<Payload<D, M>>;

  connectionStatus(): Flowable<any>;

  close(): void;
}

interface ISubscription {
  request(n: number): void;

  cancel(): void;
}

const MAX_REQUEST_N = 0x7fffffff;

@Injectable({
  providedIn: 'root'
})
export class RSocketService implements OnDestroy {
  private client: RSocketClient<Data, Metadata> | null = null;
  private socket: ReactiveSocket<Data, Metadata> | null = null;
  private subscriptions: Map<string, ISubscription> = new Map<string, ISubscription>();
  private activeStreams: Map<string, Subject<Message>> = new Map<string, Subject<Message>>();
  private reconnectTimeout: any;
  private connectionStatus$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private streamingMessageCollector: Map<string | undefined, string> = new Map<string, string>();

  constructor() {
    this.initializeRSocket();
  }

  public streamChat(chatId: string): Observable<Message> {
    if (this.activeStreams.has(chatId)) {
      return this.activeStreams.get(chatId)!.asObservable();
    }

    const stream$ = new Subject<Message>();
    this.activeStreams.set(chatId, stream$);

    if (!this.socket) {
      setTimeout(() => {
        if (this.socket) {
          this.subscribeToStream(chatId, stream$);
        }
      }, 1000);
      return stream$.asObservable();
    }

    this.subscribeToStream(chatId, stream$);
    return stream$.asObservable();
  }

  public closeStream(chatId: string): void {
    const stream = this.activeStreams.get(chatId);
    if (stream) {
      stream.complete();
      this.activeStreams.delete(chatId);
    }

    const subscription = this.subscriptions.get(chatId);
    if (subscription) {
      subscription.cancel();
      this.subscriptions.delete(chatId);
    }
  }

  public isConnected(): Observable<boolean> {
    return this.connectionStatus$.asObservable();
  }

  ngOnDestroy(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    this.activeStreams.forEach(stream => stream.complete());
    this.activeStreams.clear();

    this.subscriptions.forEach(sub => sub.cancel());
    this.subscriptions.clear();

    this.streamingMessageCollector.clear();

    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  private connectRSocket(): void {
    if (!this.client) {
      this.fallbackToDirectWebSocket();
      return;
    }

    this.client.connect().subscribe({
      onComplete: (socket: ReactiveSocket<Data, Metadata>) => {
        this.socket = socket;
        this.connectionStatus$.next(true);
        socket.connectionStatus().subscribe({
          onNext: (status: any) => {
            if (status.kind === 'CLOSED' || status.kind === 'ERROR') {
              this.connectionStatus$.next(false);
              this.handleDisconnection();
            }
          },
          onSubscribe: (sub: any) => {
            sub.request(MAX_REQUEST_N);
          }
        });
      },
      onError: (error: Error) => {
        console.error('RSocket connection error:', error);
        this.connectionStatus$.next(false);
        this.scheduleReconnection();
      },
      onSubscribe: (cancel: any) => {
        // Store cancel function if needed
      }
    });
  }

  private initializeRSocket(): void {
    try {
      const transport = new RSocketWebSocketClient(
        {
          url: 'ws://localhost:8443/rsocket',
          wsCreator: (url: string) => new WebSocket(url) as any,
        },
        BufferEncoders
      );

      this.client = new RSocketClient<Data, Metadata>({
        setup: {
          keepAlive: 60000,
          lifetime: 180000,
          dataMimeType: 'application/json',
          metadataMimeType: MESSAGE_RSOCKET_COMPOSITE_METADATA.string,
        },
        transport,
      });

      this.connectRSocket();
    } catch (error) {
      console.error('Failed to initialize RSocket:', error);
      this.fallbackToDirectWebSocket();
    }
  }

  private subscribeToStream(chatId: string, stream$: Subject<Message>): void {
    try {
      const route = `chat.stream.${chatId}`;
      const routingMetadata = encodeRoute(route);

      const metadata = encodeCompositeMetadata([
        [MESSAGE_RSOCKET_ROUTING, routingMetadata],
      ]);

      const requestPayload: Payload<Data, Metadata> = {
        data: Buffer.from(JSON.stringify({chatId})),
        metadata,
      };

      const flowable: Flowable<Payload<Data, Metadata>> = this.socket!.requestStream(requestPayload);

      flowable.subscribe({
        onNext: (payload: Payload<Data, Metadata>) => {
          try {
            const json: string | undefined = payload.data?.toString();
            if (json) {
              this.handleStreamingMessage(JSON.parse(json), stream$);
            }
          } catch (error) {
            console.error('Error parsing message:', error);
          }
        },
        onError: (error: Error) => {
          console.error('Stream error:', error);
          stream$.error(error);
          this.activeStreams.delete(chatId);
        },
        onComplete: () => {
          this.streamingMessageCollector.clear();
          stream$.complete();
          this.activeStreams.delete(chatId);
        },
        onSubscribe: (subscription: ISubscription) => {
          subscription.request(MAX_REQUEST_N);
          this.subscriptions.set(chatId, subscription);
        }
      });
    } catch (error) {
      console.error('Error setting up stream:', error);
      stream$.error(error);
    }
  }

  private handleDisconnection(): void {
    this.scheduleReconnection();
  }

  private scheduleReconnection(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    this.reconnectTimeout = setTimeout(() => {
      if (!this.connectionStatus$.value) {
        this.initializeRSocket();
      }
    }, 5000);
  }

  private handleStreamingMessage(message: Message, stream$: Subject<Message>): void {
    console.log('Received streaming message:', message.content);
    const prev: string | undefined = this.streamingMessageCollector.get(message.id);
    if (prev !== undefined) {
      const accumulator: string = prev + message.content.value;
      this.streamingMessageCollector.set(message.id, accumulator);
      stream$.next({
        ...message,
        content: {
          type: "text",
          value: accumulator
        }
      });
    } else {
      this.streamingMessageCollector.set(message.id, message.content.value);
      stream$.next(message);
    }
  }

  private createWebSocketAdapter(websocket: WebSocket): ReactiveSocket<Data, Metadata> {
    const messageHandlers = new Map<string, (data: any) => void>();
    websocket.onmessage = (event) => {
      try {
        let data: any;
        if (event.data instanceof ArrayBuffer) {
          const decoder = new TextDecoder();
          const text: string = decoder.decode(event.data);
          data = JSON.parse(text);
        } else {
          data = JSON.parse(event.data);
        }

        if (data.chatId) {
          const handler = messageHandlers.get(data.chatId);
          if (handler) {
            handler(data);
          }
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    };

    return {
      requestStream: (payload: Payload<Data, Metadata>) => {
        const data: string | undefined = payload.data?.toString();
        const chatId: any =
          data
            ? JSON.parse(data).chatId
            : null;

        if (!chatId) {
          throw new Error('Chat id is required');
        }

        const requestStream = {
          type: 'REQUEST_STREAM',
          route: `chat.stream.${chatId}`,
          data: {chatId}
        };

        if (websocket.readyState === WebSocket.OPEN) {
          websocket.send(JSON.stringify(requestStream));
        }

        return new Flowable<Payload<Data, Metadata>>((subscriber) => {
          messageHandlers.set(chatId, (message) => {
            const payload: Payload<Data, Metadata> = {
              data: Buffer.from(JSON.stringify(message))
            };
            subscriber.onNext(payload);
          });

          subscriber.onSubscribe({
            request: (n: number) => {
              // Request handling
            },
            cancel: () => {
              messageHandlers.delete(chatId);
              const cancelStream = {
                type: 'CANCEL',
                chatId
              };
              websocket.send(JSON.stringify(cancelStream));
            }
          });
        });
      },
      connectionStatus: () => {
        return new Flowable((subscriber) => {
          subscriber.onNext(
            {
              kind: websocket.readyState === WebSocket.OPEN
                ? 'CONNECTED'
                : 'CLOSED'
            });
        });
      },
      close: () => {
        websocket.close();
      }
    };
  }

  private fallbackToDirectWebSocket(): void {
    const ws = new WebSocket('ws://localhost:8443/rsocket');
    ws.binaryType = 'arraybuffer';
    ws.onopen = () => {
      this.connectionStatus$.next(true);
      this.socket = this.createWebSocketAdapter(ws);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.connectionStatus$.next(false);
      this.scheduleReconnection();
    };

    ws.onclose = () => {
      this.connectionStatus$.next(false);
      this.scheduleReconnection();
    };
  }
}
