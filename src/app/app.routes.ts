import { Routes } from '@angular/router';
import {CreatePageComponent} from './features/create-page/create-page.component';

export const routes: Routes = [
  {
    path: '',
    component: CreatePageComponent,
    title: 'Free Resume Builder | Zumely App',
  },
  {
    path: '**',
    redirectTo: 'not-found',
  }
];
