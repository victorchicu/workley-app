
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

export class SendMessageCommand extends Command {
  readonly type = 'SendMessageCommand' as const;

  constructor(public chatId: string, public message: Message) {
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


export type ActionCommand =
  | CreateChatCommand
  | SendMessageCommand;

export type ActionCommandResult =
  | CreateChatCommandResult
  | SendMessageCommandResult;

export interface Message {
  id?: string;
  actor?: string;
  content: string;
}
