import {ApplicationConfig, inject, PLATFORM_ID, provideZoneChangeDetection} from '@angular/core';
import {provideRouter} from '@angular/router';

import {routes} from './app.routes';
import {provideClientHydration, withEventReplay} from '@angular/platform-browser';
import {environment} from '../environments/environment';
import {TRACKER_PROVIDER_TOKEN} from './tracker/tracker-provider-token';
import {GtagTrackerProvider} from './tracker/impl/gtag-tracker-provider';
import {ConsoleTrackerProvider} from './tracker/impl/console-tracker-provider';
import {isPlatformBrowser} from '@angular/common';

function provideEventTracker() {
  return {
    provide: TRACKER_PROVIDER_TOKEN,
    useFactory: (): GtagTrackerProvider | ConsoleTrackerProvider => {
      const platformId: Object = inject(PLATFORM_ID);
      if (isPlatformBrowser(platformId)) {
        if (environment.production) {
          const gtagProvider = inject(GtagTrackerProvider);
          gtagProvider.addGtagToDom()
          return gtagProvider;
        }
      }
      return inject(ConsoleTrackerProvider);
    }
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({eventCoalescing: true}),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideEventTracker(),
  ]
};
