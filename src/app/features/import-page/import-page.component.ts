import {Component} from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HeadlineH1Component} from './components/import-from/headline-h1/headline-h1.component';
import {ImportFromComponent} from './components/import-from/import-from.component';

@Component({
  selector: 'app-import-page',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    HeadlineH1Component,
    ImportFromComponent
  ],
  templateUrl: './import-page.component.html',
  styleUrl: './import-page.component.css',
})
export class ImportPageComponent {

}
