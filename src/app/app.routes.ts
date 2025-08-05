import { Routes } from '@angular/router';
import {PromptFormComponent} from './features/resume/component/prompt-form/prompt-form.component';
import {AgentChatComponent} from './features/resume/component/agent-chat/agent-chat.component';
import {
  SomethingWentWrongComponent
} from './shared/component/main/something-went-wrong/something-went-wrong.component';

export const routes: Routes = [
  {
    path: '',
    component: PromptFormComponent,
    title: 'Free Resume Builder | Create Resume',
  },
  {
    path: 'resume/:resumeId',
    component: AgentChatComponent,
    title: 'Free Resume Builder | Resume AI',
  },
  {
    path: 'error',
    component: SomethingWentWrongComponent,
    title: 'Free Resume Builder | Something Went Wrong',
  },
  {
    path: '**',
    redirectTo: 'not-found',
  }
];
