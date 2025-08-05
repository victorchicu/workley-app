import {Component, EventEmitter, Input, Output} from '@angular/core';
import {PromptControl, PromptFormGroup} from "../input-prompt.component";
import {FormGroup} from '@angular/forms';
import {AsyncPipe, NgClass, NgIf} from '@angular/common';
import {LoaderService} from '../../../../../../../core/service/loader.service';
import {Observable} from 'rxjs';

@Component({
  selector: 'app-create-resume',
  standalone: true,
  imports: [
    NgClass,
    NgIf,
    AsyncPipe
  ],
  templateUrl: './create-resume.component.html',
  styleUrl: './create-resume.component.css'
})
export class CreateResumeComponent {

  @Input() activated: boolean = false;
  @Output() onClick: EventEmitter<void> = new EventEmitter<void>();

  loading$: Observable<boolean>;

  constructor(private readonly loader: LoaderService) {
    this.loading$ = loader.loading$;
  }

  handleClick() {
    console.log("Handle resume creation click")
    if (this.activated) {
      if (!this.loader.loading) {
        this.onClick.emit()
      }
    }
  }
}
