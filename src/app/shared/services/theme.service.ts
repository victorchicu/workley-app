import { Injectable, signal, computed, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type ThemePreference = 'light' | 'dark' | 'system';
export type AppliedTheme = 'light' | 'dark';

const STORAGE_KEY = 'theme';
const DEFAULT_THEME: ThemePreference = 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  private readonly _theme = signal<ThemePreference>(DEFAULT_THEME);
  private readonly _systemPrefersDark = signal(true);

  readonly theme = this._theme.asReadonly();

  readonly appliedTheme = computed<AppliedTheme>(() => {
    const pref = this._theme();
    if (pref === 'system') {
      return this._systemPrefersDark() ? 'dark' : 'light';
    }
    return pref;
  });

  private mediaQuery: MediaQueryList | null = null;
  private mediaListener: ((e: MediaQueryListEvent) => void) | null = null;

  constructor() {
    if (!this.isBrowser) return;

    this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    this._systemPrefersDark.set(this.mediaQuery.matches);

    this.mediaListener = (e: MediaQueryListEvent) => {
      this._systemPrefersDark.set(e.matches);
      if (this._theme() === 'system') {
        this.applyTheme(e.matches ? 'dark' : 'light');
      }
    };
    this.mediaQuery.addEventListener('change', this.mediaListener);

    const stored = localStorage.getItem(STORAGE_KEY) as ThemePreference | null;
    const preference = stored && ['light', 'dark', 'system'].includes(stored) ? stored : DEFAULT_THEME;
    this._theme.set(preference);
    this.applyTheme(this.appliedTheme());
  }

  setTheme(theme: ThemePreference): void {
    this._theme.set(theme);
    if (this.isBrowser) {
      localStorage.setItem(STORAGE_KEY, theme);
      this.applyTheme(this.appliedTheme());
    }
  }

  private applyTheme(theme: AppliedTheme): void {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }
}
