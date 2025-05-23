import {TrackerProvider} from '../tracker-provider';
import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConsoleTrackerProvider implements TrackerProvider {

  trackEvent(event: string, params: { [p: string]: any }): void {
    console.log(event, params);
  }
}
