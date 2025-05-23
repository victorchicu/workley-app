export interface AnalyticsProvider {

  trackEvent(event: string, params: { [key: string]: any }): void;
}
