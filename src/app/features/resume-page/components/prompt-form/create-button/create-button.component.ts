import {Component, EventEmitter, Input, Output} from '@angular/core';
import {PromptFormControl, PromptFormGroup} from "../prompt-form.component";
import {FormGroup} from '@angular/forms';
import {NgClass} from '@angular/common';

@Component({
  selector: 'app-create-button',
  standalone: true,
  imports: [
    NgClass
  ],
  templateUrl: './create-button.component.html',
  styleUrl: './create-button.component.css'
})
export class CreateButtonComponent {

  @Input() activated: boolean = false;

  @Output() onClick: EventEmitter<void> = new EventEmitter<void>();

  handleClick() {
    console.log("Handle CreateButtonComponent::handleClick")
    this.onClick.emit()
  }
}
