import {Component, Input} from '@angular/core';
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

  @Input() activated: boolean = false;
}
