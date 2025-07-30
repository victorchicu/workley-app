import {Component} from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HeadlineComponent} from './components/headline/headline.component';
import {ImportFromComponent} from './components/import-from/import-from.component';

@Component({
  selector: 'app-import-page',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    HeadlineComponent,
    ImportFromComponent
  ],
  templateUrl: './import-page.component.html',
  styleUrl: './import-page.component.css',
})
export class ImportPageComponent {

}
