import {QueryResult} from './query-result';

export interface GetChatQueryResult extends QueryResult {
  chatId: string;
}
