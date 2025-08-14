import {Component, EventEmitter, Input, Output} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule, Validators
} from '@angular/forms';
import {AsyncPipe} from '@angular/common';
import {LoaderService} from '../../../../shared/service/loader.service';
import {Observable} from 'rxjs';

export interface PromptControl {
  text: FormControl<string>;
}

export type PromptForm = FormGroup<PromptControl>;

@Component({
  selector: 'app-prompt-input',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    AsyncPipe
  ],
  templateUrl: './prompt-input.component.html',
  styleUrl: './prompt-input.component.css'
})
export class PromptInputComponent {
  form: PromptForm;
  loading$: Observable<boolean>;
  @Input() placeholder: string = "Type your message";
  @Input() deactivated: boolean = false;
  @Output() onPressEnter: EventEmitter<PromptForm> = new EventEmitter<PromptForm>();

  constructor(
    private readonly loader: LoaderService,
    private readonly formBuilder: FormBuilder
  ) {
    this.form = this.formBuilder.group({
      text: new FormControl<string>('', {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(1000),
        ]
      })
    })
    this.loading$ = this.loader.loading$;
  }

  async onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      console.log("On 'Enter' key down: ", this.form);
      event.preventDefault();
      if (this.form.invalid) {
        this.form.markAsDirty();
        this.form.markAllAsTouched();
        return;
      }
      this.onPressEnter.emit(this.form);
    }
  }
}
