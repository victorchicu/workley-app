import {Component, EventEmitter, Input, Output} from '@angular/core';
import {TooltipDirective} from '../../../../../core/directives/tooltip.directive';

@Component({
  selector: 'app-upload-button',
  standalone: true,
  imports: [
    TooltipDirective,
  ],
  templateUrl: './upload-button.component.html',
  styleUrl: './upload-button.component.css'
})
export class UploadButtonComponent {

  @Output() onClick: EventEmitter<void> = new EventEmitter<void>();

  handleClick() {
    console.log("Handle upload click")
  }
}
