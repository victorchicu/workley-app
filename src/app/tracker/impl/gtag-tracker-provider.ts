import {TrackerProvider} from '../tracker-provider';
import {Injectable} from '@angular/core';
import {environment} from '../../../environments/environment';

declare var gtag: any;

@Injectable({
  providedIn: 'root'
})
export class GtagTrackerProvider implements TrackerProvider {

  trackEvent(event: string, params: { [p: string]: any }): void {
    if (typeof gtag === 'function') {
      gtag('event', event, params);
    }
  }

  addGtagToDom(): void {
    const gtmScript = document.createElement('script');
    gtmScript.src = `https://www.googletagmanager.com/gtag/js?id=${environment.gtmId}`;
    gtmScript.async = true;
    document.head.appendChild(gtmScript);
    this.withDataLayer()
  }

  private withDataLayer() {
    const dataLayer = document.createElement('script');
    dataLayer.innerHTML = `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${environment.gtmId}');
        `;
    document.head.appendChild(dataLayer);
  }
}
