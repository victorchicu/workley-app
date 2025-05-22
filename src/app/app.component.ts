import {Component} from '@angular/core';
import {RouterLink, RouterOutlet} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {Title} from '@angular/platform-browser';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [FormsModule, RouterLink, NgIf],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  link: string = '';

  showWarning: boolean = false;
  warningMessage: string = '';

  constructor(private readonly title: Title) {
    title.setTitle('LinkedIn Resume Builder | LinkedIn to Resume in one click');
  }

  go(): void {
    if (this.link.trim()) {
      // Simulate a service unavailability scenario
      // In a real app, this would be based on an API error response
      this.warningMessage = "The Service is Unavailable. We are under heavy load, please try again later.";
      this.showWarning = true;
      // Optional: Automatically hide the warning after some time
      setTimeout(() => {
        this.hideWarning();
      }, 7000); // Hides after 5 seconds
    } else {
      // Handle empty link case if needed, e.g., show a different message or do nothing
      this.warningMessage = "Please enter a LinkedIn profile link.";
      this.showWarning = true;
    }
  }

  hideWarning(): void {
    this.showWarning = false;
    this.warningMessage = '';
  }
}
