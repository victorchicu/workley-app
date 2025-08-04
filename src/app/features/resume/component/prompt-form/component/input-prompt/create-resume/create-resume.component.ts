import {Component, EventEmitter, Input, Output} from '@angular/core';
import {PromptControl, PromptFormGroup} from "../input-prompt.component";
import {FormGroup} from '@angular/forms';
import {NgClass, NgIf} from '@angular/common';

@Component({
  selector: 'app-create-resume',
  standalone: true,
  imports: [
    NgClass,
    NgIf
  ],
  templateUrl: './create-resume.component.html',
  styleUrl: './create-resume.component.css'
})
export class CreateResumeComponent {

  @Input() activated: boolean | null = false;
  @Input() isLoading: boolean | null = false;

  @Output() onClick: EventEmitter<void> = new EventEmitter<void>();

  handleClick() {
    console.log("Handle resume creation click")
    if (!this.isLoading) {
      this.onClick.emit()
    }
  }
}
