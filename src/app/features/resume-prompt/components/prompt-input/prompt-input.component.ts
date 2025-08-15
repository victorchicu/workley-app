import {Component, EventEmitter, inject, Input, Output} from '@angular/core';
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
import {PromptForm, ResumePromptService} from '../../services/resume-prompt.service';

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
  @Input() form!: PromptForm;
  @Input() placeholder: string = "How can I help you today?";
  @Input() deactivated: boolean = false;
  @Output() onKeyDown: EventEmitter<void> = new EventEmitter<void>();

  readonly promptService = inject(ResumePromptService);

  async handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      console.log("On 'Enter' key down: ", this.form);
      event.preventDefault();
      if (this.form.invalid) {
        this.form.markAsDirty();
        this.form.markAllAsTouched();
        return;
      }
      this.onKeyDown.emit();
    }
  }
}
