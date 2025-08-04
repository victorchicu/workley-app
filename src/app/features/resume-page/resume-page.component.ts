import {Component} from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ResumeHeadlineComponent} from './components/resume-headline/resume-headline.component';
import {CreateResumeComponent} from './components/create-resume/create-resume.component';

@Component({
  selector: 'app-resume-page',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    ResumeHeadlineComponent,
    CreateResumeComponent
  ],
  templateUrl: './resume-page.component.html',
  styleUrl: './resume-page.component.css',
})
export class ResumePageComponent {

}
