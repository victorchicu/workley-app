import {Inject, Injectable, Optional} from '@angular/core';
import {ANALYTICS_PROVIDER_TOKEN} from './analytics-provider-token';
import {AnalyticsProvider} from './analytics-provider';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  constructor(@Inject(ANALYTICS_PROVIDER_TOKEN) private readonly analyticsProvider: AnalyticsProvider) {

  }

  trackEvent(event: string, params: { [key: string]: any }): void {
    try {
      this.analyticsProvider.trackEvent(event, params);
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  }
}
