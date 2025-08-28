import {Component, ElementRef, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {TooltipDirective} from '../../../../core/directive/tooltip.directive';

@Component({
  selector: 'app-prompt-file-upload',
  standalone: true,
  imports: [
    TooltipDirective

  ],
  templateUrl: './prompt-file-upload.component.html',
  styleUrl: './prompt-file-upload.component.css'
})
export class PromptFileUploadComponent {

  @Output() onFileSelected: EventEmitter<File> = new EventEmitter<File>();
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  handleClick(): void {
    console.log("Handle upload click");
    this.fileInput?.nativeElement.click();
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.onFileSelected.emit(input.files[0]);
      input.value = '';
    }
  }
}
