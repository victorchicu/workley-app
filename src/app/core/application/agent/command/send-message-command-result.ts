import {ChatMessage} from '../../../../features/resume/component/agent-chat/states/chat-message';

export interface SendMessageCommandResult {
  message: ChatMessage;
  reply: ChatMessage;
}
