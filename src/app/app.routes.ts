import { Routes } from '@angular/router';
import {PromptFormComponent} from './features/resume/component/prompt-form/prompt-form.component';
import {AgentChatComponent} from './features/resume/component/agent-chat/agent-chat.component';

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
    path: '**',
    redirectTo: 'not-found',
  }
];
