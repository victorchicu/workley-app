
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


export class CreateChat extends Command {
  readonly type = 'CreateChat' as const;

  constructor(public prompt: string) {
    super();
  }
}

export class AddMessage extends Command {
  readonly type = 'AddMessage' as const;

  constructor(public chatId: string, public message: Message) {
    super();
  }
}



export interface CreateChatResult extends CommandResult {
  type: 'CreateChatResult';
  chatId: string;
  message: Message;
}

export interface AddMessageResult extends CommandResult {
  type: 'AddMessageResult';
  chatId: string;
  message: Message;
}



export type ActionCommand =
  | CreateChat
  | AddMessage;

export type ActionCommandResult =
  | CreateChatResult
  | AddMessageResult;

export interface Message {
  id?: string;
  role?: Role;
  chatId?: string;
  ownedBy?: string;
  createdAt?: Date;
  content: string;
}
