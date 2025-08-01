import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {PromptValueRequest} from '../components/prompt-form/prompt-form.component';
import {Observable} from 'rxjs';
import {AsyncTaskResponse} from './objects/async-task-response';
import {ProcessingTask} from './objects/processing-task';

@Injectable({
  providedIn: 'root'
})
export class ResumeService {

  constructor(private readonly httpClient: HttpClient) {

  }

  createFromPrompt(promptValue: PromptValueRequest): Observable<AsyncTaskResponse<ProcessingTask>> {
    console.log("Creating resume from prompt", promptValue)
    return this.httpClient.post<AsyncTaskResponse<ProcessingTask>>("/api/resumes", promptValue)
  }
}
