import { Routes } from '@angular/router';
import {PromptComponent} from './features/prompt/prompt.component';
import {ChatComponent} from './features/chat/chat.component';
import {
  ErrorComponent
} from './shared/ui/components/error/error.component';

export const routes: Routes = [
  {
    path: '',
    component: PromptComponent,
    title: 'Free Resume Builder | Create Resume',
  },
  {
    path: 'chat/:chatId',
    component: ChatComponent,
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
