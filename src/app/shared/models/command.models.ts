
export enum Role {
  ANONYMOUS = "ANONYMOUS",
  CLIENT = "CLIENT",
  ASSISTANT = "ASSISTANT",
  UNKNOWN = "UNKNOWN"
}


export abstract class Command {
  abstract readonly type: string;
}

export interface CommandResult {
  type: string;
}


export class CreateChatCommand extends Command {
  readonly type = 'CreateChatCommand' as const;

  constructor(public prompt: string) {
    super();
  }
}

export class AddChatMessageCommand extends Command {
  readonly type = 'AddChatMessageCommand' as const;

  constructor(public chatId: string, public message: Message) {
    super();
  }
}



export interface CreateChatCommandResult extends CommandResult {
  type: 'CreateChatCommandResult';
  chatId: string;
  message: Message;
}

export interface AddChatMessageCommandResult extends CommandResult {
  type: 'AddChatMessageCommandResult';
  chatId: string;
  message: Message;
}



export type ActionCommand =
  | CreateChatCommand
  | AddChatMessageCommand;

export type ActionCommandResult =
  | CreateChatCommandResult
  | AddChatMessageCommandResult;

export interface Message {
  id?: string;
  chatId?: string;
  authorId?: string;
  writtenBy?: Role;
  createdAt?: Date;
  content: string;
}
