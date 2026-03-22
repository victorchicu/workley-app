import {Component, inject} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MainComponent} from './shared/components/main/main.component';
import {ThemeService} from './shared/services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule, MainComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  host: {
    class: 'h-screen grid grid-rows-[auto_1fr_auto] relative bg-bg-primary'
  }
})
export class AppComponent {
  private readonly themeService = inject(ThemeService);
}
