import {Component, Input} from '@angular/core';
import {CreateFormControl, CreateFormGroup} from "../create-form.component";
import {FormGroup} from '@angular/forms';
import {NgClass} from '@angular/common';

@Component({
  selector: 'app-create-button',
  standalone: true,
  imports: [
    NgClass
  ],
  templateUrl: './create-button.component.html',
  styleUrl: './create-button.component.css'
})
export class CreateButtonComponent {

  @Input() isActive: boolean = false;
}
