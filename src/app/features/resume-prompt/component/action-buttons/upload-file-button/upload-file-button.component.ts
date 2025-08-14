import {Component, EventEmitter, Input, Output} from '@angular/core';
import {TooltipDirective} from '../../../../../core/directive/tooltip.directive';

@Component({
  selector: 'app-upload-file-button',
  standalone: true,
  imports: [
    TooltipDirective,
  ],
  templateUrl: './upload-file-button.component.html',
  styleUrl: './upload-file-button.component.css'
})
export class UploadFileButtonComponent {

  @Output() onClick: EventEmitter<void> = new EventEmitter<void>();

  handleClick() {
    console.log("Handle upload click")
  }
}
