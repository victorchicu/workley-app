export interface CreateJobRequest {
  title: string;
  tags: string[];
  description: string;
  draftChatId?: string;
}

export interface JobResponse {
  id: string;
  title: string;
  tags: string[];
  description: string;
  draftChatId?: string;
  status: string;
  createdAt: string;
}

export interface JobDraft {
  title: string;
  tags: string[];
  description: string;
  draftChatId: string | null;
  step: 'title' | 'tags' | 'description';
}
