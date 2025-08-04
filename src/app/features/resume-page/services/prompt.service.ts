import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Prompt} from '../components/create-resume/create-resume.component';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PromptService {

  constructor(private readonly httpClient: HttpClient) {

  }

  sendPrompt(prompt: Prompt): Observable<string> {
    return this.httpClient.post<string>("/api/prompts", prompt)
  }
}
