export interface CreateJobRequest {
  title: string;
  location?: string | null;
  workMode: string;
  description: string;
  draftChatId?: string;
}

export interface JobResponse {
  id: string;
  title: string;
  location?: string | null;
  workMode: string;
  description: string;
  draftChatId?: string;
  status: string;
  createdAt: string;
}
