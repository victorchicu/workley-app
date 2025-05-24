import {Component, ViewChild} from '@angular/core';
import {RouterLink, RouterOutlet} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {ToastComponent} from './components/toast/toast.component';

@Component({
  selector: 'app-root',
  imports: [FormsModule, RouterLink, ToastComponent, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {

}
