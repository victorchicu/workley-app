import {Query} from './query';

export class GetChatQuery extends Query {
  readonly type = 'GetChatQuery' as const;

  constructor(public chatId: string) {
    super();
  }
}
