import {Component, ElementRef, HostListener, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {NgClass} from '@angular/common';
import {TooltipDirective} from '../../../../core/directives/tooltip.directive';

export interface ImportControl {
  url: FormControl<string | null>;
}

export type ImportFormGroup = FormGroup<ImportControl>;

export interface ImportValue {
  url: string;
}

@Component({
  selector: 'app-linked-in-import-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgClass,
    TooltipDirective
  ],
  templateUrl: './linked-in-import-form.component.html',
  styleUrl: './linked-in-import-form.component.css'
})
export class LinkedInImportFormComponent {

  @ViewChild('textInput') textInputRef!: ElementRef;
  importForm: ImportFormGroup;
  private readonly LINKED_IN_URL_PATTERN = /^(https?:\/\/)?(www\.)?linkedin\.com\/in\/[\w-]+\/?$/i;
  private readonly LINKED_IN_PROFILE_URL_PATTERN = /^(https?:\/\/)?(www\.)?linkedin\.com\/in\/([a-zA-Z0-9_-]+[a-zA-Z0-9_-]*)\/?$/;

  constructor(private readonly formBuilder: FormBuilder) {
    this.importForm = this.formBuilder.nonNullable.group({
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

  handleImportForm(): void {
    console.log("Handle import form: ", this.importForm)
    if (this.importForm.valid) {
      const importValue: ImportValue = this.importForm.value as ImportValue
      console.log("Import value: ", importValue)
    }
  }
}
