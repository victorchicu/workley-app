import {ChatMessage} from '../../../../features/resume/component/agent-chat/states/chat-message';

export interface GetChatHistoryQueryResult {
  chatId: string;
  messages: ChatMessage[];
}
