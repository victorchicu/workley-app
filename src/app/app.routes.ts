import { Routes } from '@angular/router';
import {LinkedInResumeInputFormComponent} from './components/linked-in-resume-input-form/linked-in-resume-input-form.component';
import {LinkedInResumeProfileDraftComponent} from './components/linked-in-resume-profile-draft/linked-in-resume-profile-draft.component';
import {NotFoundComponent} from './components/not-found/not-found.component';

export const routes: Routes = [
  {
    path: '',
    component: LinkedInResumeInputFormComponent,
    title: 'LinkedIn Resume Builder | LinkedIn to Resume in one click'
  },
  {
    path: 'resumes/:profileId/draft',
    component: LinkedInResumeProfileDraftComponent,
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
