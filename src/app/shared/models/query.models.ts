import {Message, Payload} from './command.models';


export abstract class Query {
  abstract readonly type: string;
}

export class GetChat extends Query {
  readonly type = 'GetChat' as const;

  constructor(public chatId: string) {
    super();
  }
}

export type QueryType =
  GetChat;

export interface GetChatPayload extends Payload {
  type: 'GetChat';
  chatId: string;
  messages: Message[];
}

export type PayloadType =
  GetChatPayload;
