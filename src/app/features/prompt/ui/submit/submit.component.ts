import {Component, computed, EventEmitter, inject, Input, Output} from '@angular/core';
import {AsyncPipe, NgClass, NgIf} from '@angular/common';
import {PromptFacade} from '../../../../shared/services/prompt.facade';
import {SpinnerComponent} from '../../../../shared/ui/components/spinner/spinner.component';
import {CommandService} from '../../../../shared/services/command.service';

@Component({
  selector: 'app-submit',
  standalone: true,
  imports: [
    NgClass,
    SpinnerComponent
  ],
  templateUrl: './submit.component.html',
  styleUrl: './submit.component.css'
})
export class SubmitComponent {

  @Input() activated: boolean = true;
  @Output() clicked: EventEmitter<void> = new EventEmitter<void>();

  private readonly facade: PromptFacade = inject(PromptFacade);

  viewModel = computed(() => ({
    submitting: this.facade.submitting(),
  }));

  handleClick() {
    this.clicked.emit();
  }
}
