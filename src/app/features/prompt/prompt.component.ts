import {Component, inject} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HeadlineComponent} from './ui/components/headline/headline.component';
import {InputComponent} from './ui/components/input/input.component';
import {PromptFacade} from './prompt.facade';
import {AsyncPipe} from '@angular/common';
import {
  SubmitComponent
} from './ui/components/submit/submit.component';
import {UploadFileComponent} from './ui/components/upload-file/upload-file.component';

@Component({
  selector: 'app-resume-prompt',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    HeadlineComponent,
    InputComponent,
    AsyncPipe,
    SubmitComponent,
    UploadFileComponent,
  ],
  templateUrl: './prompt.component.html',
  styleUrl: './prompt.component.css',
})
export class PromptComponent {
  readonly promptFacade: PromptFacade = inject(PromptFacade);
}
