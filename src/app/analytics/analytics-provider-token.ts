import {InjectionToken} from '@angular/core';
import {AnalyticsProvider} from './analytics-provider';

export const ANALYTICS_PROVIDER_TOKEN = new InjectionToken<AnalyticsProvider>('ANALYTICS_PROVIDER');
