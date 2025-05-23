import {TrackerProvider} from '../tracker-provider';
import {Injectable} from '@angular/core';
import {environment} from '../../../environments/environment';

declare var dataLayer: any[];

@Injectable({
  providedIn: 'root'
})
export class GtmTrackerProvider implements TrackerProvider {

  trackEvent(event: string, params: { [p: string]: any }): void {
    if (typeof dataLayer !== 'undefined' && Array.isArray(dataLayer)) {
      dataLayer.push({
        event: event,
        ...params
      });
    }
  }

  addGtmToDom(): void {
    this.addGtmHeadScript();
    this.addGtmBodyNoscript();
  }

  private isGtmLoaded(): boolean {
    const scripts = document.getElementsByTagName('script');
    for (let i = 0; i < scripts.length; i++) {
      if (scripts[i].src && scripts[i].src.includes('googletagmanager.com/gtm.js')) {
        return true;
      }
    }
    return false;
  }

  private addGtmHeadScript(): void {
    if (this.isGtmLoaded()) {
      return;
    }

    (window as any).dataLayer = (window as any).dataLayer || [];
    (window as any).dataLayer.push({
      'gtm.start': new Date().getTime(),
      event: 'gtm.js'
    });

    const gtmScript = document.createElement('script');
    gtmScript.async = true;
    gtmScript.src = `https://www.googletagmanager.com/gtm.js?id=${environment.gtmId}`;

    const firstScript = document.getElementsByTagName('script')[0];
    if (firstScript && firstScript.parentNode) {
      firstScript.parentNode.insertBefore(gtmScript, firstScript);
    } else {
      document.head.appendChild(gtmScript);
    }
  }

  private addGtmBodyNoscript(): void {
    if (document.getElementById('gtm-noscript')) {
      return;
    }

    const noscript = document.createElement('noscript');
    noscript.id = 'gtm-noscript';

    const iframe = document.createElement('iframe');
    iframe.src = `https://www.googletagmanager.com/ns.html?id=${environment.gtmId}`;
    iframe.height = '0';
    iframe.width = '0';
    iframe.style.display = 'none';
    iframe.style.visibility = 'hidden';

    noscript.appendChild(iframe);

    if (document.body) {
      document.body.insertBefore(noscript, document.body.firstChild);
    }
  }
}
