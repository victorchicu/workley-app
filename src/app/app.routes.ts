import { Routes } from '@angular/router';
import {ResumePromptComponent} from './features/resume-prompt/resume-prompt.component';
import {ChatAssistantComponent} from './features/chat-assistant/chat-assistant.component';
import {
  ErrorComponent
} from './shared/component/error/error.component';

export const routes: Routes = [
  {
    path: '',
    component: ResumePromptComponent,
    title: 'Free Resume Builder | Create Resume',
  },
  {
    path: 'chat/:chatId',
    component: ChatAssistantComponent,
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
