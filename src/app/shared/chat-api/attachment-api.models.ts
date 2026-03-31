export interface AttachmentResponse {
  attachmentId: string;
  filename: string;
  mimeType: string;
  fileSize: number;
}

export interface AttachmentUploadState {
  status: 'uploading' | 'complete' | 'error';
  progress: number;
  attachmentId: string | null;
  filename: string;
  mimeType: string;
  fileSize: number;
  errorMessage: string | null;
}
