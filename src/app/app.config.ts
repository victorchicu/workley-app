import {ApplicationConfig, inject, PLATFORM_ID, provideZoneChangeDetection} from '@angular/core';
import {provideRouter, withComponentInputBinding, withViewTransitions} from '@angular/router';

import {routes} from './app.routes';
import {provideClientHydration, withEventReplay} from '@angular/platform-browser';
import {environment} from '../environments/environment';
import {ANALYTICS_PROVIDER_TOKEN} from './analytics/analytics-provider-token';
import {Ga4AnalyticsProvider} from './analytics/ga4-analytics-provider';
import {ConsoleAnalyticsProvider} from './analytics/console-analytics-provider';
import {isPlatformBrowser} from '@angular/common';

function provideAnalytics() {
  return {
    provide: ANALYTICS_PROVIDER_TOKEN,
    useFactory: (): Ga4AnalyticsProvider | ConsoleAnalyticsProvider => {
      const platformId: Object = inject(PLATFORM_ID);
      if (isPlatformBrowser(platformId)) {
        if (environment.production) {
          const ga4AnalyticsProvider = inject(Ga4AnalyticsProvider);
          ga4AnalyticsProvider.addGtmToDom()
          return ga4AnalyticsProvider;
        }
      }
      return inject(ConsoleAnalyticsProvider);
    }
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withComponentInputBinding(), withViewTransitions()),
    provideZoneChangeDetection({eventCoalescing: true}),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideAnalytics(),
  ]
};
