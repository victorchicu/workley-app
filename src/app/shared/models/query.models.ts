import {Message} from './command.models';

export abstract class Query {
  abstract readonly type: string;
}

export interface QueryResult {
  type: string;
}

export class GetChatQuery extends Query {
  readonly type = 'GetChatQuery' as const;

  constructor(public chatId: string) {
    super();
  }
}

export interface GetChatQueryResult extends QueryResult {
  type: 'GetChatQueryResult';
  chatId: string;
  messages: Message[];
}

export type GetQuery =
  GetChatQuery;

export type GetQueryResult =
  GetChatQueryResult;
