import {Result} from './result';

export interface CreateChatResult extends Result {
  chatId: string;
  firstReply: string;
}
