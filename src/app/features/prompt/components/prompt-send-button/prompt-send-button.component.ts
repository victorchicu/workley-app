import {Component, computed, EventEmitter, inject, Input, Output} from '@angular/core';
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

  @Input() deactivated: boolean = true;
  @Input() isSubmitting: boolean = false;
  @Output() clicked: EventEmitter<void> = new EventEmitter<void>();

  viewModel = computed(() => ({
    isSubmitting: this.isSubmitting,
  }));

  handleClick() {
    if (!this.isSubmitting) {
      this.clicked.emit();
    }
  }
}
