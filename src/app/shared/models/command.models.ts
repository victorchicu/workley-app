
export enum Role {
  ANONYMOUS = "ANONYMOUS",
  CUSTOMER = "CUSTOMER",
  ASSISTANT = "ASSISTANT",
  UNKNOWN = "UNKNOWN"
}

export interface Message {
  id?: string;
  role?: Role;
  chatId?: string;
  ownedBy?: string;
  createdAt?: Date;
  content: string;
}

export abstract class Command {
  abstract readonly type: string;
}

export class CreateChatInput extends Command {
  readonly type = 'CreateChat' as const;

  constructor(public prompt: string) {
    super();
  }
}

export class AddMessageInput extends Command {
  readonly type = 'AddMessage' as const;

  constructor(public chatId: string, public message: Message) {
    super();
  }
}

export type CommandInputType =
  | CreateChatInput
  | AddMessageInput;


export interface Output {
  type: string;
}

export interface CreateChatOutput extends Output {
  type: 'CreateChat';
  chatId: string;
  message: Message;
}

export interface AddMessageOutput extends Output {
  type: 'AddMessage';
  chatId: string;
  message: Message;
}

export type CommandOutputType =
  | CreateChatOutput
  | AddMessageOutput;
