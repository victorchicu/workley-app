import { Routes } from '@angular/router';
import {PromptFormComponent} from './features/resume/component/prompt-form/prompt-form.component';
import {AgentChatComponent} from './features/resume/component/agent-chat/agent-chat.component';
import {
  ErrorComponent
} from './shared/component/error/error.component';

export const routes: Routes = [
  {
    path: '',
    component: PromptFormComponent,
    title: 'Free Resume Builder | Create Resume',
  },
  {
    path: 'chat/:chatId',
    component: AgentChatComponent,
    title: 'Free Resume Builder | Agent Chat',
  },
  {
    path: 'error',
    component: ErrorComponent,
    title: 'Free Resume Builder | Oops! Something went wrong.',
  },
  {
    path: '**',
    redirectTo: 'not-found',
  }
];
