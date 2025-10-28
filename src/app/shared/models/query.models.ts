import {Message} from './command.models';


export abstract class QueryInput {
  abstract readonly type: string;
}

export class GetChat extends QueryInput {
  readonly type = 'GetChat' as const;

  constructor(public chatId: string) {
    super();
  }
}

export type QueryInputType =
  GetChat;

export interface QueryOutput {
  type: string;
}

export interface GetChatOutput extends QueryOutput {
  type: 'GetChat';
  chatId: string;
  messages: Message[];
}

export type QueryOutputType =
  GetChatOutput;
