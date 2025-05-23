export interface TrackerProvider {

  trackEvent(event: string, params: { [key: string]: any }): void;
}
