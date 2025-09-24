import {Component} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MainComponent} from './shared/ui/components/main/main.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule, MainComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  host: {
    class: 'h-screen grid grid-rows-[auto_1fr_auto] relative'
  }
})
export class AppComponent {

}
