import { Routes } from '@angular/router';
import {ImportPageComponent} from './features/import-page/import-page.component';

export const routes: Routes = [
  {
    path: '',
    component: ImportPageComponent,
    title: 'Free Resume Builder | Zumely App',
  },
  {
    path: '**',
    redirectTo: 'not-found',
  }
];
