import {Component} from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HeadlineComponent} from './components/headline/headline.component';
import {CreateFormComponent} from './components/create-form/create-form.component';

@Component({
  selector: 'app-create-page',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    HeadlineComponent,
    CreateFormComponent
  ],
  templateUrl: './create-page.component.html',
  styleUrl: './create-page.component.css',
})
export class CreatePageComponent {

}
