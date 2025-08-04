import { Routes } from '@angular/router';
import {PromptFormComponent} from './features/prompt-form/prompt-form.component';

export const routes: Routes = [
  {
    path: '',
    component: PromptFormComponent,
    title: 'Free Resume Builder | Zumely App',
  },
  {
    path: '**',
    redirectTo: 'not-found',
  }
];
