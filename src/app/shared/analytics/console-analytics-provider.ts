import {AnalyticsProvider} from './analytics-provider';
import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConsoleAnalyticsProvider implements AnalyticsProvider {

  trackEvent(event: string, params: { [p: string]: any }): void {
    console.log(event, params);
  }
}
