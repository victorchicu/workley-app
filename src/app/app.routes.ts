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
    title: 'AI Job Search | Zumely',
  },
  {
    path: 'chat/:chatId',
    component: ChatComponent,
    title: 'AI Job Search | AI assistant',
  },
  {
    path: 'error',
    component: ErrorComponent,
    title: 'AI Job Search | Oops! Something went wrong.',
  },
  {
    path: '**',
    redirectTo: 'not-found',
  }
];
