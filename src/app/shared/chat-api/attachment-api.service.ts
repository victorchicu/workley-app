import {Injectable} from '@angular/core';
import {HttpClient, HttpEventType, HttpProgressEvent, HttpResponse} from '@angular/common/http';
import {Observable} from 'rxjs';
import {filter, scan} from 'rxjs/operators';
import {AttachmentResponse, AttachmentUploadState} from './attachment-api.models';

@Injectable({providedIn: 'root'})
export class AttachmentApiService {
  private readonly baseUrl = '/api/attachments';

  constructor(private readonly httpClient: HttpClient) {}

  upload(file: File): Observable<AttachmentUploadState> {
    const formData = new FormData();
    formData.append('file', file);

    return this.httpClient.post<AttachmentResponse>(this.baseUrl, formData, {
      withCredentials: true,
      reportProgress: true,
      observe: 'events'
    }).pipe(
      filter(event =>
        event.type === HttpEventType.UploadProgress ||
        event.type === HttpEventType.Response
      ),
      scan((state: AttachmentUploadState, event) => {
        if (event.type === HttpEventType.UploadProgress) {
          const progressEvent = event as HttpProgressEvent;
          const progress = progressEvent.total
            ? Math.round((progressEvent.loaded / progressEvent.total) * 100)
            : 0;
          return {...state, progress, status: 'uploading' as const};
        }
        if (event.type === HttpEventType.Response) {
          const response = (event as HttpResponse<AttachmentResponse>).body!;
          return {
            ...state,
            status: 'complete' as const,
            progress: 100,
            attachmentId: response.attachmentId,
            filename: response.filename,
            mimeType: response.mimeType,
            fileSize: response.fileSize,
          };
        }
        return state;
      }, {
        status: 'uploading',
        progress: 0,
        attachmentId: null,
        filename: file.name,
        mimeType: file.type,
        fileSize: file.size,
        errorMessage: null,
      })
    );
  }

  delete(attachmentId: string): Observable<void> {
    return this.httpClient.delete<void>(`${this.baseUrl}/${attachmentId}`, {
      withCredentials: true
    });
  }

  getDownloadUrl(attachmentId: string): string {
    return `${this.baseUrl}/${attachmentId}/download`;
  }
}
