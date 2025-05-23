import {InjectionToken} from '@angular/core';
import {TrackerProvider} from './tracker-provider';

export const TRACKER_PROVIDER_TOKEN = new InjectionToken<TrackerProvider>('TRACKER_PROVIDER');
