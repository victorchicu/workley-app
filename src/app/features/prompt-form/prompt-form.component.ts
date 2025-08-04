import {Component} from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {TextHeadlineComponent} from './components/text-headline/text-headline.component';
import {InputPromptComponent} from './components/input-prompt/input-prompt.component';

@Component({
  selector: 'app-resume-page',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    TextHeadlineComponent,
    InputPromptComponent
  ],
  templateUrl: './prompt-form.component.html',
  styleUrl: './prompt-form.component.css',
})
export class PromptFormComponent {

}
