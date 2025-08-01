import {Component} from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HeadlineComponent} from './components/headline/headline.component';
import {PromptFormComponent} from './components/prompt-form/prompt-form.component';

@Component({
  selector: 'app-resume-page',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    HeadlineComponent,
    PromptFormComponent
  ],
  templateUrl: './resume-page.component.html',
  styleUrl: './resume-page.component.css',
})
export class ResumePageComponent {

}
