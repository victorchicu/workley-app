
export enum Role {
  ANONYMOUS = "ANONYMOUS",
  CUSTOMER = "CUSTOMER",
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

export class AddMessageCommand extends Command {
  readonly type = 'AddMessageCommand' as const;

  constructor(public chatId: string, public message: Message) {
    super();
  }
}



export interface CreateChatCommandResult extends CommandResult {
  type: 'CreateChatCommandResult';
  chatId: string;
  message: Message;
}

export interface AddMessageCommandResult extends CommandResult {
  type: 'AddMessageCommandResult';
  chatId: string;
  message: Message;
}



export type ActionCommand =
  | CreateChatCommand
  | AddMessageCommand;

export type ActionCommandResult =
  | CreateChatCommandResult
  | AddMessageCommandResult;

export interface Message {
  id?: string;
  role?: Role;
  chatId?: string;
  authorId?: string;
  createdAt?: Date;
  content: string;
}
