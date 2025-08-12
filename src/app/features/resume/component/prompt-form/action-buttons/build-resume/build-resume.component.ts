import {Component, EventEmitter, Input, Output} from '@angular/core';
import {AsyncPipe, NgClass, NgIf} from '@angular/common';
import {LoaderService} from '../../../../../../core/application/loader.service';
import {Observable} from 'rxjs';
import {Prompt} from '../../../../../../core/application/agent/agent.models';

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
