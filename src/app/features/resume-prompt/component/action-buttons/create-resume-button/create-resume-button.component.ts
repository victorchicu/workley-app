import {Component, EventEmitter, Input, Output} from '@angular/core';
import {AsyncPipe, NgClass, NgIf} from '@angular/common';
import {LoaderService} from '../../../../../shared/service/loader.service';
import {Observable} from 'rxjs';
import {Prompt} from '../../../../../core/application/models/agent.models';

@Component({
  selector: 'app-create-resume-button',
  standalone: true,
  imports: [
    NgClass,
    NgIf,
    AsyncPipe
  ],
  templateUrl: './create-resume-button.component.html',
  styleUrl: './create-resume-button.component.css'
})
export class CreateResumeButtonComponent {

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
