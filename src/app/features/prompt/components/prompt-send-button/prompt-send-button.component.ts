import {Component, computed, EventEmitter, inject, input, Input, output, Output} from '@angular/core';
import {NgClass} from '@angular/common';
import {SpinnerComponent} from '../../../../shared/ui/components/spinner/spinner.component';

@Component({
  selector: 'app-prompt-send-button',
  standalone: true,
  imports: [
    NgClass,
    SpinnerComponent
  ],
  templateUrl: './prompt-send-button.component.html',
  styleUrl: './prompt-send-button.component.css'
})
export class PromptSendButtonComponent {

  readonly deactivated = input(false);
  readonly isSubmitting = input(false);
  readonly clicked = output<void>()

  viewModel = computed(() => ({
    deactivated: this.deactivated(),
    isSubmitting: this.isSubmitting()
  }));

  handleClick() {
    if (!this.isSubmitting) {
      this.clicked.emit();
    }
  }
}
