import { Routes } from '@angular/router';
import {ResumeBuilderComponent} from './components/resume-builder/resume-builder.component';

export const routes: Routes = [
  {
    path: '',
    component: ResumeBuilderComponent,
    title: 'Resume Builder | Resume in one click'
  },
  {
    path: '**',
    redirectTo: 'not-found',
  }
];
