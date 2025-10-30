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
    title: 'Find Jobs. Find Talent | Workley',
  },
  {
    path: 'chat/:chatId',
    component: ChatComponent,
    title: 'Find Jobs. Find Talent | AI assistant',
  },
  {
    path: 'error',
    component: ErrorComponent,
    title: 'Find Jobs. Find Talent | Oops! Something went wrong.',
  },
  {
    path: '**',
    redirectTo: 'not-found',
  }
];
