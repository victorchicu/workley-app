
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

export type CommandType =
  | CreateChat
  | AddMessage;


export interface Payload {
  type: string;
}

export interface CreateChatPayload extends Payload {
  type: 'CreateChat';
  chatId: string;
  message: Message;
}

export interface AddMessagePayload extends Payload {
  type: 'AddMessage';
  chatId: string;
  message: Message;
}

export type PayloadType =
  | CreateChatPayload
  | AddMessagePayload;
