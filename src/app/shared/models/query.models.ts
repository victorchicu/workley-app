import {Message} from './command.models';

export abstract class Query {
  abstract readonly type: string;
}

export interface QueryResult {
  type: string;
}

export class GetChat extends Query {
  readonly type = 'GetChat' as const;

  constructor(public chatId: string) {
    super();
  }
}

export interface GetChatResult extends QueryResult {
  type: 'GetChatResult';
  chatId: string;
  messages: Message[];
}

export type ActionQuery =
  GetChat;

export type ActionQueryResult =
  GetChatResult;
