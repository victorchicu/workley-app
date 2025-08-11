
export interface Message {
  id: string;
  content: string;
  sender: 'agent' | 'user';
  timestamp: Date;
  status?: 'sending' | 'sent' | 'error';
}
