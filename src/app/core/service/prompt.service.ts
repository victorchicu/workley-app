import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Prompt} from '../../features/resume/component/prompt-form/prompt-input/prompt-input.component';
import {Observable} from 'rxjs';
import {Result} from './result/result';

@Injectable({
  providedIn: 'root'
})
export class PromptService {

  constructor(private readonly httpClient: HttpClient) {
    //
  }

  handlePrompt<T extends Result>(prompt: Prompt): Observable<T> {
    return this.httpClient.post<T>("/api/prompts", prompt)
  }
}
