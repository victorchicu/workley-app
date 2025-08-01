import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {PromptFormValue} from '../components/prompt-form/prompt-form.component';

@Injectable({
  providedIn: 'root'
})
export class ResumeService {

  constructor(private readonly httpClient: HttpClient) {

  }

  handlePrompt(prompt: PromptFormValue) {
    return this.httpClient.post("/resumes", prompt)
  }
}
