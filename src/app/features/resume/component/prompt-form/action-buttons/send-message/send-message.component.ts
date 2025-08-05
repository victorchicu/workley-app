import {Component, EventEmitter, Output} from '@angular/core';
import {TooltipDirective} from '../../../../../../core/directive/tooltip.directive';

@Component({
  selector: 'app-send-message',
  standalone: true,
  imports: [
    TooltipDirective
  ],
  templateUrl: './send-message.component.html',
  styleUrl: './send-message.component.css'
})
export class SendMessageComponent {
  @Output() onClick: EventEmitter<void> = new EventEmitter<void>();

  handleClick() {
    console.log("Handle send message click")
  }
}
