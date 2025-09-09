import {Injectable, OnDestroy} from '@angular/core';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {Message} from '../models/command.models';
import {Flowable} from 'rsocket-flowable';
import {
  BufferEncoders,
  encodeCompositeMetadata,
  encodeRoute, MESSAGE_RSOCKET_COMPOSITE_METADATA,
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
  private activeStreams: Map<string, Subject<Message>> = new Map<string, Subject<Message>>();
  private subscriptions: Map<string, ISubscription> = new Map<string, ISubscription>();
  private reconnectTimeout: any;
  private connectionStatus$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private currentStreamingMessages: Map<string | undefined, string> = new Map<string, string>();

  constructor() {
    this.initializeRSocket();
  }

  private initializeRSocket(): void {
    try {
      // Create WebSocket transport
      const transport = new RSocketWebSocketClient(
        {
          url: 'ws://localhost:8443/rsocket',
          wsCreator: (url: string) => new WebSocket(url) as any,
        },
        BufferEncoders
      );

      // Create RSocket client with proper generic types
      this.client = new RSocketClient<Data, Metadata>({
        setup: {
          keepAlive: 60000,
          lifetime: 180000,
          dataMimeType: 'application/json',
          metadataMimeType: MESSAGE_RSOCKET_COMPOSITE_METADATA.string,
        },
        transport,
      });

      this.connect();
    } catch (error) {
      console.error('Failed to initialize RSocket:', error);
      this.fallbackToDirectWebSocket();
    }
  }

  private connect(): void {
    if (!this.client) {
      console.error('RSocket client not initialized');
      this.fallbackToDirectWebSocket();
      return;
    }

    this.client.connect().subscribe({
      onComplete: (socket: ReactiveSocket<Data, Metadata>) => {
        this.socket = socket;
        this.connectionStatus$.next(true);
        console.log('RSocket connected successfully');
        socket.connectionStatus().subscribe({
          onNext: (status: any) => {
            console.log('Connection status:', status);
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

  private fallbackToDirectWebSocket(): void {
    console.log('Falling back to direct WebSocket implementation');
    // Implement direct WebSocket as fallback
    const ws = new WebSocket('ws://localhost:8443/rsocket');
    ws.binaryType = 'arraybuffer';
    ws.onopen = () => {
      console.log('Direct WebSocket connected');
      this.connectionStatus$.next(true);
      // Create a simple adapter
      this.socket = this.createWebSocketAdapter(ws);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.connectionStatus$.next(false);
      this.scheduleReconnection();
    };

    ws.onclose = () => {
      console.log('WebSocket closed');
      this.connectionStatus$.next(false);
      this.scheduleReconnection();
    };
  }

  private createWebSocketAdapter(ws: WebSocket): ReactiveSocket<Data, Metadata> {
    const messageHandlers = new Map<string, (data: any) => void>();

    ws.onmessage = (event) => {
      try {
        // Handle incoming messages
        let data: any;
        if (event.data instanceof ArrayBuffer) {
          const decoder = new TextDecoder();
          const text = decoder.decode(event.data);
          data = JSON.parse(text);
        } else {
          data = JSON.parse(event.data);
        }

        // Route to appropriate handler
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
        // Extract chatId from payload
        const data = payload.data?.toString();
        const chatId = data ? JSON.parse(data).chatId : null;

        if (!chatId) {
          throw new Error('ChatId is required');
        }

        // Send subscription request
        const subscribeMessage = {
          type: 'REQUEST_STREAM',
          route: `chat.stream.${chatId}`,
          data: {chatId}
        };

        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(subscribeMessage));
        }

        // Create a flowable for this stream
        const flowable = new Flowable<Payload<Data, Metadata>>((subscriber) => {
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
              // Send unsubscribe message
              const unsubscribeMessage = {
                type: 'CANCEL',
                chatId
              };
              ws.send(JSON.stringify(unsubscribeMessage));
            }
          });
        });

        return flowable;
      },
      connectionStatus: () => {
        return new Flowable((subscriber) => {
          subscriber.onNext({kind: ws.readyState === WebSocket.OPEN ? 'CONNECTED' : 'CLOSED'});
        });
      },
      close: () => {
        ws.close();
      }
    };
  }

  private handleDisconnection(): void {
    console.log('RSocket disconnected, attempting to reconnect...');
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

  private subscribeToStream(chatId: string, stream$: Subject<Message>): void {
    try {
      // Create routing metadata
      const route = `chat.stream.${chatId}`;
      const routingMetadata = encodeRoute(route);

      // Create composite metadata
      const metadata = encodeCompositeMetadata([
        [MESSAGE_RSOCKET_ROUTING, routingMetadata],
      ]);

      // Create request payload
      const requestPayload: Payload<Data, Metadata> = {
        data: Buffer.from(JSON.stringify({chatId})),
        metadata,
      };

      // Request stream from server
      const flowable = this.socket!.requestStream(requestPayload);

      flowable.subscribe({
        onNext: (payload: Payload<Data, Metadata>) => {
          try {
            const messageData = payload.data?.toString();
            if (messageData) {
              const message: Message = JSON.parse(messageData);
              console.log('Received message chunk:', message);

              // Handle streaming accumulation
              this.handleStreamingMessage(message, stream$);
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
          console.log('Stream completed for chat:', chatId);
          // Clear accumulated content for completed stream
          this.currentStreamingMessages.clear();
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

  private handleStreamingMessage(message: Message, stream$: Subject<Message>): void {
    // Check if this is a continuation of an existing message
    const existingContent = this.currentStreamingMessages.get(message.id);

    if (existingContent !== undefined) {
      // Accumulate content
      const accumulatedContent = existingContent + message.content;
      this.currentStreamingMessages.set(message.id, accumulatedContent);

      // Emit updated message
      stream$.next({
        ...message,
        content: accumulatedContent
      });
    } else {
      // New message
      this.currentStreamingMessages.set(message.id, message.content);
      stream$.next(message);
    }
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

    this.currentStreamingMessages.clear();

    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}
