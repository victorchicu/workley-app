import {Component, EventEmitter, Input, Output} from '@angular/core';
import {PromptControl, PromptFormGroup} from "../prompt-form.component";
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

  @Input() isLoading: boolean = false;
  @Input() activated: boolean = false;

  @Output() onClick: EventEmitter<void> = new EventEmitter<void>();

  handleClick() {
    if (!this.isLoading) {
      console.log("Handle resume creation click")
      this.onClick.emit()
    }
  }
}
