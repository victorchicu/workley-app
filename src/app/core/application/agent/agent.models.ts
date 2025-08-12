
export abstract class Query {
  abstract readonly type: string;
}

export abstract class Command {
  abstract readonly type: string;
}


export interface QueryResult {
  type: string;
}

export interface CommandResult {
  type: string;
}


export class CreateChatCommand extends Command {
  readonly type = 'CreateChatCommand' as const;

  constructor(public prompt: Prompt) {
    super();
  }
}

export class SendMessageCommand extends Command {
  readonly type = 'SendMessageCommand' as const;

  constructor(public chatId: string, public message: Message) {
    super();
  }
}

export class GetChatQuery extends Query {
  readonly type = 'GetChatHistoryQuery' as const;

  constructor(public chatId: string) {
    super();
  }
}


export interface CreateChatCommandResult extends CommandResult {
  type: 'CreateChatCommandResult';
  chatId: string;
  message: Message;
}

export interface SendMessageCommandResult extends CommandResult {
  type: 'SendMessageCommandResult';
  chatId: string;
  message: Message;
}

export interface GetChatQueryResult extends QueryResult {
  type: 'GetChatQueryResult';
  chatId: string;
  messages: Message[];
}


export type AgentCommand =
  | CreateChatCommand
  | SendMessageCommand;

export type AgentCommandResult =
  | CreateChatCommandResult
  | SendMessageCommandResult;

export type AgentQuery =
  GetChatQuery;

export type AgentQueryResult =
  GetChatQueryResult;


export interface Message {
  id?: string;
  role: 'AGENT' | 'USER';
  content: string;
  status?: 'sending' | 'sent' | 'error';
}

export interface ChatState {
  chatId?: string;
  messages: Message[];
  loading: boolean;
  error?: string;
  isTyping?: boolean;
  currentUserMessage?: string;
}

export interface Prompt {
  text: string;
}
