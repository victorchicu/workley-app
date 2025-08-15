import { Routes } from '@angular/router';
import {PromptPageComponent} from './features/resume-prompt/pages/prompt-page.component';
import {ChatPageComponent} from './features/resume-chat/pages/chat-page.component';
import {
  ErrorComponent
} from './shared/component/error/error.component';

export const routes: Routes = [
  {
    path: '',
    component: PromptPageComponent,
    title: 'Free Resume Builder | Create Resume',
  },
  {
    path: 'chat/:chatId',
    component: ChatPageComponent,
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
