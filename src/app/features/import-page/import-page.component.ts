import {Component} from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HeadlineH1Component} from './components/headline-h1/headline-h1.component';
import {LinkedInImportFormComponent} from './components/linked-in-import-form/linked-in-import-form.component';

@Component({
  selector: 'app-import-page',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    HeadlineH1Component,
    LinkedInImportFormComponent
  ],
  templateUrl: './import-page.component.html',
  styleUrl: './import-page.component.css',
})
export class ImportPageComponent {

}
