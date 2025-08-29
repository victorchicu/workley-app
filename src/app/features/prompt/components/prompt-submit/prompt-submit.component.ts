import {Component, computed, EventEmitter, inject, Input, Output} from '@angular/core';
import {AsyncPipe, NgClass, NgIf} from '@angular/common';
import {PromptState} from '../../prompt-state.service';
import {SpinnerComponent} from '../../../../shared/ui/components/spinner/spinner.component';
import {CommandService} from '../../../../shared/services/command.service';

@Component({
  selector: 'app-prompt-submit',
  standalone: true,
  imports: [
    NgClass,
    SpinnerComponent
  ],
  templateUrl: './prompt-submit.component.html',
  styleUrl: './prompt-submit.component.css'
})
export class PromptSubmitComponent {

  @Input() activated: boolean = true;
  @Output() clicked: EventEmitter<void> = new EventEmitter<void>();

  private readonly facade: PromptState = inject(PromptState);

  viewModel = computed(() => ({
    submitting: this.facade.submitting(),
  }));

  handleClick() {
    this.clicked.emit();
  }
}
