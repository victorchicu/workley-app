import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Prompt} from '../components/prompt-form/prompt-form.component';
import {Observable} from 'rxjs';
import {AsyncTaskResponse} from './objects/async-task-response';
import {ResumeCreationInitiated} from './objects/resume-creation-initiated';

@Injectable({
  providedIn: 'root'
})
export class PromptService {

  constructor(private readonly httpClient: HttpClient) {

  }

  sendPrompt(prompt: Prompt): Observable<string> {
    console.log("Sending prompt", prompt)
    return this.httpClient.post<string>("/api/prompts", prompt)
  }
}
