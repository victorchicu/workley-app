import { Routes } from '@angular/router';
import {PromptComponent} from './features/prompt/prompt.component';
import {ChatComponent} from './features/chat/chat.component';
import {
  ErrorComponent
} from './shared/components/error/error.component';
import {TermsOfUseComponent} from './features/terms-of-use/terms-of-use.component';
import {PrivacyPolicyComponent} from './features/privacy-policy/privacy-policy.component';

export const routes: Routes = [
  {
    path: '',
    component: PromptComponent,
    title: 'Workley Assistant',
  },
  {
    path: 'chat/:chatId',
    component: ChatComponent,
    title: 'Workley Assistant',
  },
  {
    path: 'shared/:messageId',
    component: ErrorComponent,
    title: 'Workley Assistant | Shared Message',
  },
  {
    path: 'terms-of-use',
    component: TermsOfUseComponent,
    title: 'Workley Assistant | Terms of Use',
  },
  {
    path: 'privacy-policy',
    component: PrivacyPolicyComponent,
    title: 'Workley Assistant | Privacy Policy',
  },
  {
    path: 'error',
    component: ErrorComponent,
    title: 'Workley Assistant | Oops! Something went wrong.',
  },
  {
    path: 'not-found',
    component: ErrorComponent,
    title: 'Workley Assistant | Page not found',
  },
  {
    path: '**',
    redirectTo: 'not-found',
  }
];
