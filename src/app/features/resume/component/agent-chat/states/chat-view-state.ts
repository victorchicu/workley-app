import {ChatMessage} from './chat-message';

export interface ChatViewState {
  chatId: string;
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
}
