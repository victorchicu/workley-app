import {
  ApplicationConfig, inject, PLATFORM_ID, provideAppInitializer,
  provideZoneChangeDetection
} from '@angular/core';
import {provideRouter} from '@angular/router';

import {routes} from './app.routes';
import {provideClientHydration, withEventReplay} from '@angular/platform-browser';
import {environment} from '../environments/environment';
import {TRACKER_PROVIDER_TOKEN} from './tracker/tracker-provider-token';
import {GtagTrackerProvider} from './tracker/impl/gtag-tracker-provider';
import {ConsoleTrackerProvider} from './tracker/impl/console-tracker-provider';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({eventCoalescing: true}),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    {
      provide: TRACKER_PROVIDER_TOKEN,
      useFactory: () => {
        return environment.production
          ? inject(GtagTrackerProvider)
          : inject(ConsoleTrackerProvider);
      }
    },
  ]
};
