import {Component, EventEmitter, inject, Input, Output} from '@angular/core';
import {AsyncPipe, NgClass, NgIf} from '@angular/common';
import {ResumePromptService} from '../../../services/resume-prompt.service';

@Component({
  selector: 'app-create-resume-button',
  standalone: true,
  imports: [
    NgClass,
    NgIf,
    AsyncPipe
  ],
  templateUrl: './create-resume-button.component.html',
  styleUrl: './create-resume-button.component.css'
})
export class CreateResumeButtonComponent {

  @Input() activated: boolean = true;
  @Output() onClick: EventEmitter<void> = new EventEmitter<void>();

  readonly promptService = inject(ResumePromptService);

  handleClick() {
    this.onClick.emit();
  }
}
