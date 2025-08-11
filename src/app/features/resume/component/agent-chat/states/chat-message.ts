
export interface ChatMessage {
  id: string;
  content: string;
  sender: 'agent' | 'user';
  timestamp: Date;
  status?: 'sending' | 'sent' | 'error';
}
