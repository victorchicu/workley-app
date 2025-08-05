import {Component, EventEmitter, Input, Output} from '@angular/core';
import {TooltipDirective} from '../../../../../../../core/directive/tooltip.directive';

@Component({
  selector: 'app-upload-resume',
  standalone: true,
  imports: [
    TooltipDirective,
  ],
  templateUrl: './upload-resume.component.html',
  styleUrl: './upload-resume.component.css'
})
export class UploadResumeComponent {

  @Output() onClick: EventEmitter<void> = new EventEmitter<void>();

  handleClick() {
    console.log("Handle upload click")
  }
}
