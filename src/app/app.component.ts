import {Component} from '@angular/core';
import {RouterLink, RouterOutlet} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {Title} from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  imports: [FormsModule, RouterLink],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  link: string = '';


  constructor(private readonly title: Title) {
    title.setTitle('LinkedIn Resume Builder | LinkedIn to Resume in one click');
  }

  go(): void {
    if (this.link.trim()) {

    }
  }
}
