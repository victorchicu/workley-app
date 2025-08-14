import { Routes } from '@angular/router';
import {ResumePromptComponent} from './features/resume-prompt/resume-prompt.component';
import {ResumeChatComponent} from './features/resume-chat/resume-chat.component';
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
    component: ResumeChatComponent,
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
