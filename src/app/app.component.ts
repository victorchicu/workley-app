import {Component, Inject, OnDestroy, PLATFORM_ID, ViewChild} from '@angular/core';
import {RouterLink} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {Title} from '@angular/platform-browser';
import {ToastComponent} from './components/toast/toast.component';
import {AnalyticsService} from './analytics/analytics.service';

@Component({
  selector: 'app-root',
  imports: [FormsModule, RouterLink, ToastComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  link: string = '';
  @ViewChild(ToastComponent) toastComponent!: ToastComponent;

  constructor(title: Title, private analyticsService: AnalyticsService) {
    title.setTitle('LinkedIn Resume Builder | LinkedIn to Resume in one click');
  }

  go(): void {
    this.toastComponent.show("We're currently experiencing high traffic and our service is temporarily unavailable. Please try again later.", 7000)
    this.scrollToToast();
    this.analyticsService.trackEvent("linkedin_profile_convert", { "url": this.link });
  }

  scrollToToast(): void {
    const element = document.getElementById('toastSection');
    if (element) {
      element.scrollIntoView({behavior: 'smooth', block: 'start'});
    }
  }
}
