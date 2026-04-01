export enum Role {
  ANONYMOUS = "ANONYMOUS",
  USER = "USER",
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

export interface Attachment extends Content {
  type: 'ATTACHMENT';
  attachmentId: string;
  filename: string;
  mimeType: string;
  fileSize: number;
}

export type ContentType =
  | ReplyChunk
  | ReplyCompleted
  | ReplyError
  | Attachment;

export interface Message {
  id?: string;
  role?: Role;
  chatId?: string;
  ownedBy?: string;
  createdAt?: Date;
  content: ContentType;
}

export interface CreateChatRequest {
  prompt: string;
}

export interface AddMessageRequest {
  text: string;
}

export interface CreateChatResponse {
  chatId: string;
  message: Message;
}

export interface AddMessageResponse {
  chatId: string;
  message: Message;
}

export interface GetChatResponse {
  chatId: string;
  messages: Message[];
}
