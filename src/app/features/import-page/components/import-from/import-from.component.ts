import {Component, ElementRef, HostListener, input, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {NgClass} from '@angular/common';
import {TooltipDirective} from '../../../../core/directives/tooltip.directive';
import {ImportButtonComponent} from './import-button/import-button.component';
import {UploadButtonComponent} from './upload-button/upload-button.component';

export interface ImportFormControl {
  url: FormControl<string | null>;
}

export type ImportFormGroup = FormGroup<ImportFormControl>;

export interface ImportFormValue {
  url: string;
}

@Component({
  selector: 'app-import-from',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ImportButtonComponent,
    UploadButtonComponent
  ],
  templateUrl: './import-from.component.html',
  styleUrl: './import-from.component.css'
})
export class ImportFromComponent {

  form: ImportFormGroup;
  private readonly LINKED_IN_URL_PATTERN = /^(https?:\/\/)?(www\.)?linkedin\.com\/in\/[\w-]+\/?$/i;
  private readonly LINKED_IN_PROFILE_URL_PATTERN = /^(https?:\/\/)?(www\.)?linkedin\.com\/in\/([a-zA-Z0-9_-]+[a-zA-Z0-9_-]*)\/?$/;

  constructor(private readonly formBuilder: FormBuilder) {
    this.form = this.formBuilder.nonNullable.group({
      url: new FormControl<string>('', {
        validators: [Validators.required,
          Validators.minLength(29),
          Validators.maxLength(100),
          Validators.pattern(this.LINKED_IN_URL_PATTERN),
          Validators.pattern(this.LINKED_IN_PROFILE_URL_PATTERN)
        ]
      })
    })
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    console.log("On document click: ", target.tagName, "")
  }

  handleImport(): void {
    console.log("Handle import form: ", this.form);
    if (this.form.invalid) {
      this.markForm();
      return;
    }
    const importValue: ImportFormValue = this.form.value as ImportFormValue
    this.form.reset()
  }

  private markForm() {
    this.form.markAsDirty();
    this.form.markAllAsTouched();
  }
}
