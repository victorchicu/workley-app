import {Component, EventEmitter, inject, Input, Output} from '@angular/core';
import {AsyncPipe, NgClass, NgIf} from '@angular/common';
import {PromptFacade} from '../../../prompt.facade';

@Component({
  selector: 'app-submit',
  standalone: true,
  imports: [
    NgClass,
    NgIf,
    AsyncPipe
  ],
  templateUrl: './submit.component.html',
  styleUrl: './submit.component.css'
})
export class SubmitComponent {

  @Input() activated: boolean = true;
  @Output() clicked: EventEmitter<void> = new EventEmitter<void>();

  readonly facade: PromptFacade = inject(PromptFacade);

  handleClick() {
    this.clicked.emit();
  }
}
