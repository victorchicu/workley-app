import {ChangeDetectionStrategy, Component, computed, input, Input, Signal, signal} from '@angular/core';
import {NgIf} from "@angular/common";
import {finalize, from, isObservable, Observable} from 'rxjs';

@Component({
  selector: 'app-spinner',
  standalone: true,
  imports: [],
  templateUrl: './spinner.component.html',
  styleUrl: './spinner.component.css'
})
export class SpinnerComponent {

}
