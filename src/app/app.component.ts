import {Component, OnDestroy} from '@angular/core';
import {RouterLink, RouterOutlet} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {Title} from '@angular/platform-browser';
import {NgIf} from '@angular/common';

declare var gtag: Function;

@Component({
  selector: 'app-root',
  imports: [FormsModule, RouterLink, NgIf],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnDestroy {
  link: string = '';

  showWarning: boolean = false;
  warningMessage: string = '';
  private warningTimerId: any = null;

  constructor(private readonly title: Title) {
    title.setTitle('LinkedIn Resume Builder | LinkedIn to Resume in one click');
  }

  go(): void {
    this.clearTimeout()

    if (typeof gtag === 'function') {
      gtag('event', 'go_button_click', {
        'event_category': 'UserInteraction',
        'event_label':'Link Submitted',
        'link_provided': this.link,
      });
    }

    this.warningMessage = "We're currently experiencing high traffic and our service is temporarily unavailable. Please try again in a few moments.";
    this.showWarning = true;
    setTimeout(() => {
      this.hideWarning();
    }, 7000);
  }

  hideWarning(): void {
    this.clearTimeout();
    this.showWarning = false;
    this.warningMessage = '';
  }

  ngOnDestroy(): void {
    this.clearTimeout();
  }

  private clearTimeout() {
    if (this.warningTimerId) {
      clearTimeout(this.warningTimerId);
    }
  }
}
