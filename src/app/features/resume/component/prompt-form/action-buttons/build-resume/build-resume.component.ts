import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Prompt, PromptControl, PromptForm} from "../../prompt-input/prompt-input.component";
import {FormGroup} from '@angular/forms';
import {AsyncPipe, NgClass, NgIf} from '@angular/common';
import {LoaderService} from '../../../../../../core/application/loader.service';
import {Observable} from 'rxjs';

@Component({
  selector: 'app-build-resume',
  standalone: true,
  imports: [
    NgClass,
    NgIf,
    AsyncPipe
  ],
  templateUrl: './build-resume.component.html',
  styleUrl: './build-resume.component.css'
})
export class BuildResumeComponent {

  @Input() activated: boolean = true;
  @Output() onClick: EventEmitter<Prompt> = new EventEmitter<Prompt>();

  loading$: Observable<boolean>;

  constructor(private readonly loader: LoaderService) {
    this.loading$ = loader.loading$;
  }

  handleClick() {
    this.onClick.emit()
  }
}
