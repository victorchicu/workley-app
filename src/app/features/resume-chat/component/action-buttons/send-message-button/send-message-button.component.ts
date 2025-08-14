import {Component, EventEmitter, Output} from '@angular/core';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-send-message-button',
  standalone: true,
  imports: [
    FormsModule

  ],
  templateUrl: './send-message-button.component.html',
  styleUrl: './send-message-button.component.css'
})
export class SendMessageButtonComponent {
  @Output() onClick: EventEmitter<void> = new EventEmitter<void>();

  handleClick() {
    console.log("Handle send message click")
  }
}
