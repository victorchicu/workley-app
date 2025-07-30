import {Component, Input} from '@angular/core';
import {ImportFormControl, ImportFormGroup} from "../import-from.component";
import {FormGroup} from '@angular/forms';
import {NgClass} from '@angular/common';

@Component({
  selector: 'app-import-button',
  standalone: true,
  imports: [
    NgClass
  ],
  templateUrl: './import-button.component.html',
  styleUrl: './import-button.component.css'
})
export class ImportButtonComponent {

  @Input() form!: ImportFormGroup;
}
