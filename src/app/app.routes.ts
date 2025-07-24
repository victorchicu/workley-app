import { Routes } from '@angular/router';
import {ResumeBuilderComponent} from './components/resume-builder/resume-builder.component';
import {NotFoundComponent} from './components/not-found/not-found.component';

export const routes: Routes = [
  {
    path: '',
    component: ResumeBuilderComponent,
    title: 'Resume Builder | Resume in one click'
  },
  {
    path: 'not-found',
    component: NotFoundComponent,
    title: 'Resume Builder | Page Not Found'
  },
  {
    path: '**',
    redirectTo: 'not-found',
  }
];
