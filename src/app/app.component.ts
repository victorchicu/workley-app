import {Component} from '@angular/core';
import {RouterLink, RouterOutlet} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {FooterComponent} from './shared/component/footer/footer.component';
import {MainComponent} from './shared/component/main/main.component';
import {HeaderComponent} from './shared/component/header/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule, FooterComponent, MainComponent, HeaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  host: {
    class: 'h-screen grid grid-rows-[auto_1fr_auto] font-inter relative'
  }
})
export class AppComponent {

}
