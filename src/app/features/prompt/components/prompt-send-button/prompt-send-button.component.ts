import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import {NgClass} from '@angular/common';
import {SpinnerComponent} from '../../../../shared/components/spinner/spinner.component';

@Component({
  selector: 'app-prompt-send-button',
  standalone: true,
  imports: [
    NgClass,
    SpinnerComponent
  ],
  templateUrl: './prompt-send-button.component.html',
  styleUrl: './prompt-send-button.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PromptSendButtonComponent {

  readonly deactivated = input(false);
  readonly isSubmitting = input(false);
  readonly clicked = output<void>()

  handleClick() {
    this.clicked.emit();
  }
}
