export enum Role {
  ANONYMOUS = "ANONYMOUS",
  CUSTOMER = "CUSTOMER",
  ASSISTANT = "ASSISTANT",
  UNKNOWN = "UNKNOWN"
}

export enum ErrorCode {
  AI_MODEL_CIRCUIT_OPEN = "AI_MODEL_CIRCUIT_OPEN",
  AI_MODEL_BACKEND_UNREACHABLE = "AI_MODEL_BACKEND_UNREACHABLE",
  AI_MODEL_HTTP_ERROR = "AI_MODEL_HTTP_ERROR",
  UNKNOWN = "UNKNOWN"
}

export interface Content {
  type: string;
}

export interface ReplyChunk extends Content {
  type: 'REPLY_CHUNK';
  text: string;
}

export interface ReplyCompleted extends Content {
  type: 'REPLY_COMPLETED';
}

export interface ReplyError extends Content {
  type: 'REPLY_ERROR';
  code: ErrorCode;
  reason: string;
}

export type ContentType =
  | ReplyChunk
  | ReplyCompleted
  | ReplyError;

export interface Message {
  id?: string;
  role?: Role;
  chatId?: string;
  ownedBy?: string;
  createdAt?: Date;
  content: ContentType;
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
