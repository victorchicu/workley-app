import {Component, EventEmitter, Input, Output} from '@angular/core';
import {PromptControl, PromptFormGroup} from "../create-resume.component";
import {FormGroup} from '@angular/forms';
import {NgClass, NgIf} from '@angular/common';

@Component({
  selector: 'app-create-button',
  standalone: true,
  imports: [
    NgClass,
    NgIf
  ],
  templateUrl: './create-button.component.html',
  styleUrl: './create-button.component.css'
})
export class CreateButtonComponent {

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
