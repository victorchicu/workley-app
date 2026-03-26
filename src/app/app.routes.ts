import { Routes } from '@angular/router';
import {PromptComponent} from './features/prompt/prompt.component';
import {ChatComponent} from './features/chat/chat.component';
import {
  ErrorComponent
} from './shared/components/error/error.component';

export const routes: Routes = [
  {
    path: '',
    component: PromptComponent,
    title: 'Workley',
  },
  {
    path: 'chat/:chatId',
    component: ChatComponent,
    title: 'Workley',
  },
  {
    path: 'error',
    component: ErrorComponent,
    title: 'Workley | Oops! Something went wrong.',
  },
  {
    path: 'not-found',
    component: ErrorComponent,
    title: 'Workley | Page not found',
  },
  {
    path: '**',
    redirectTo: 'not-found',
  }
];
