import { Routes } from '@angular/router';
import {LinkedInResumeBuilderComponent} from './components/linked-in-resume-builder/linked-in-resume-builder.component';
import {LinkedInResumeDraftComponent} from './components/linked-in-resume-draft/linked-in-resume-draft.component';
import {NotFoundComponent} from './components/not-found/not-found.component';

export const routes: Routes = [
  {
    path: '',
    component: LinkedInResumeBuilderComponent,
    title: 'LinkedIn Resume Builder | LinkedIn to Resume in one click'
  },
  {
    path: 'resume-draft/:profileId',
    component: LinkedInResumeDraftComponent,
    title: 'LinkedIn Resume Builder | Draft Resume'
  },
  {
    path: 'not-found',
    component: NotFoundComponent,
    title: 'LinkedIn Resume Builder | Page Not Found'
  },
  {
    path: '**',
    redirectTo: 'not-found',
  }
];
