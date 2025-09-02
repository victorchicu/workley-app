import {Component, computed, EventEmitter, inject, Input, Output} from '@angular/core';
import {NgClass} from '@angular/common';
import {PromptState} from '../../../../shared/services/prompt-state.service';
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
  @Output() clicked: EventEmitter<void> = new EventEmitter<void>();

  private readonly facade: PromptState = inject(PromptState);

  viewModel = computed(() => ({
    submitting: this.facade.isSubmitting(),
  }));

  handleClick() {
    this.clicked.emit();
  }
}
