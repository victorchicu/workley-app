import {Message} from './command.models';


export abstract class QueryInput {
  abstract readonly type: string;
}

export class GetChatInput extends QueryInput {
  readonly type = 'GetChat' as const;

  constructor(public chatId: string) {
    super();
  }
}

export type QueryInputType =
  GetChatInput;

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
