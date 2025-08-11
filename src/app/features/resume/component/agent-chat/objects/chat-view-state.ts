import {Message} from './message';

export interface ChatViewState {
  chatId: string;
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}
