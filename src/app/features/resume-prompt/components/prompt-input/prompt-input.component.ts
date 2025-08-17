import {Component, ElementRef, EventEmitter, inject, Input, Output, ViewChild} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule, Validators
} from '@angular/forms';
import {AsyncPipe, NgIf} from '@angular/common';
import {SpinnerService} from '../../../../shared/services/spinner.service';
import {Observable} from 'rxjs';
import {PromptForm, ResumePromptService} from '../../services/resume-prompt.service';

@Component({
  selector: 'app-prompt-input',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    AsyncPipe,
    NgIf
  ],
  templateUrl: './prompt-input.component.html',
  styleUrl: './prompt-input.component.css'
})
export class PromptInputComponent {
  @Input() form!: PromptForm;
  @Input() placeholder: string = "How can I help you today?";
  @Input() deactivated: boolean = false;
  @Output() onKeyDown: EventEmitter<void> = new EventEmitter<void>();
  @ViewChild('promptTextarea') textareaRef!: ElementRef<HTMLTextAreaElement>;

  hasMultipleLines = false;

  readonly promptService = inject(ResumePromptService);

  checkTextareaHeight(): void {
    const textarea = this.textareaRef.nativeElement;

    // Reset height to auto to get the scroll height
    textarea.style.height = 'auto';
    const scrollHeight = textarea.scrollHeight;

    // You can adjust this threshold based on your line height
    const singleLineHeight = 24; // min-h-[24px] from your CSS
    this.hasMultipleLines = scrollHeight > singleLineHeight + 8; // +8 for some tolerance

    // Set the actual height
    textarea.style.height = Math.min(scrollHeight, 120) + 'px'; // max-h-[120px]
  }

  async handleKeyDown(event: KeyboardEvent) {
    setTimeout(() => {
      this.checkTextareaHeight();
    }, 0);

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
