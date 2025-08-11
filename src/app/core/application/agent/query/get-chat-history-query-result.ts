import {Message} from '../../../../features/resume/component/agent-chat/objects/message';

export interface GetChatHistoryQueryResult {
  chatId: string;
  data: Message[];
}
