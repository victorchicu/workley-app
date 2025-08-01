import { Routes } from '@angular/router';
import {ResumePageComponent} from './features/resume-page/resume-page.component';

export const routes: Routes = [
  {
    path: '',
    component: ResumePageComponent,
    title: 'Free Resume Builder | Zumely App',
  },
  {
    path: '**',
    redirectTo: 'not-found',
  }
];
