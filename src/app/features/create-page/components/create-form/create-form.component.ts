import {Component} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {CreateButtonComponent} from './create-button/create-button.component';
import {UploadButtonComponent} from './upload-button/upload-button.component';

export interface CreateFormControl {
  text: FormControl<string | null>;
}

export type CreateFormGroup = FormGroup<CreateFormControl>;

export interface CreateFormValue {
  text: string;
}

@Component({
  selector: 'app-create-from',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CreateButtonComponent,
    UploadButtonComponent,
    FormsModule
  ],
  templateUrl: './create-form.component.html',
  styleUrl: './create-form.component.css'
})
export class CreateFormComponent {

  form: CreateFormGroup;

  constructor(private readonly formBuilder: FormBuilder) {
    this.form = this.formBuilder.nonNullable.group({
      text: new FormControl<string>('', {
        validators: [Validators.required,
          Validators.minLength(1),
          Validators.maxLength(1000),
        ]
      })
    })
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.submitForm();
    }
  }

  private markForm() {
    this.form.markAsDirty();
    this.form.markAllAsTouched();
  }

  private submitForm(): void {
    console.log("Handle submit form: ", this.form);
    if (this.form.invalid) {
      this.markForm();
      return;
    }
    this.form.reset()
  }
}
