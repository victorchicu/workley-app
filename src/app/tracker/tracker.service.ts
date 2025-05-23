import {Inject, Injectable, Optional} from '@angular/core';
import {TRACKER_PROVIDER_TOKEN} from './tracker-provider-token';
import {TrackerProvider} from './tracker-provider';

@Injectable({
  providedIn: 'root'
})
export class TrackerService {
  constructor(@Inject(TRACKER_PROVIDER_TOKEN) private readonly trackerProvider: TrackerProvider) {

  }

  trackEvent(event: string, params: { [key: string]: any }): void {
    try {
      this.trackerProvider.trackEvent(event, params);
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  }
}
