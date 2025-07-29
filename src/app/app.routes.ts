import { Routes } from '@angular/router';
import {ParsePageComponent} from './pages/parse-page/parse-page.component';

export const routes: Routes = [
  {
    path: '',
    component: ParsePageComponent,
    title: 'Free Resume Builder | Zumely App',
  },
  {
    path: '**',
    redirectTo: 'not-found',
  }
];
