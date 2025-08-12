import {Prompt} from '../../../features/resume/component/prompt-form/prompt-input/prompt-input.component';


export abstract class Query {
  abstract readonly type: string;
}

export abstract class Command {
  abstract readonly type: string;
}


export interface QueryResult {
}

export interface CommandResult {

}


export class CreateChatCommand extends Command {
  readonly type = 'CreateChatCommand' as const;

  constructor(public prompt: Prompt) {
    super();
  }
}

export class SendPromptCommand extends Command {
  readonly type = 'SendPromptCommand' as const;

  constructor(public chatId: string, public prompt: Prompt) {
    super();
  }
}

export class GetChatHistoryQuery extends Query {
  readonly type = 'GetChatHistoryQuery' as const;

  constructor(public chatId: string) {
    super();
  }
}


export interface CreateChatCommandResult extends CommandResult {
  chatId: string;
  message: Message;
}

export interface SendMessageCommandResult extends CommandResult {
  chatId: string;
  message: Message;
}

export interface GetChatHistoryQueryResult extends QueryResult {
  chatId: string;
  messages: Message[];
}


export type AgentCommand =
  | CreateChatCommand
  | SendPromptCommand;

export type AgentResult =
  | CreateChatCommandResult
  | SendMessageCommandResult;


export interface Message {
  id?: string;
  role: 'agent' | 'user';
  data: string;
}

export interface ChatState {
  chatId?: string;
  messages: Message[];
  loading: boolean;
  error?: string;
}
