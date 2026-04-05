import { Injectable, inject, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of } from 'rxjs';

export interface ContinueResponse {
  next_step: string;
}

export interface StepResponse {
  next_step: string;
  pre_auth_token: string;
}

export interface MeResponse {
  email: string;
}

export interface AuthErrorResponse {
  error: string;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  private static readonly AUTH_HINT_KEY = 'auth_hint';

  private readonly _isAuthenticated = signal(this.readAuthHint());
  private readonly _userEmail = signal<string | null>(null);
  private readonly _sessionChecked = signal(false);

  readonly isAuthenticated = this._isAuthenticated.asReadonly();
  readonly userEmail = this._userEmail.asReadonly();
  readonly sessionChecked = this._sessionChecked.asReadonly();

  constructor() {
    if (this.isBrowser) {
      const handledCallback = this.handleOAuthCallback();
      if (!handledCallback) {
        this.checkSession();
      }
    }
  }

  private readAuthHint(): boolean {
    if (!this.isBrowser) return false;
    return localStorage.getItem(AuthService.AUTH_HINT_KEY) === '1';
  }

  private writeAuthHint(authenticated: boolean): void {
    if (!this.isBrowser) return;
    if (authenticated) {
      localStorage.setItem(AuthService.AUTH_HINT_KEY, '1');
    } else {
      localStorage.removeItem(AuthService.AUTH_HINT_KEY);
    }
  }

  private checkSession(): void {
    this.http.get<MeResponse>('/api/auth/me', { withCredentials: true })
      .pipe(catchError(() => of(null)))
      .subscribe(response => {
        if (response) {
          this._isAuthenticated.set(true);
          this._userEmail.set(response.email);
        } else {
          this._isAuthenticated.set(false);
          this._userEmail.set(null);
        }
        this.writeAuthHint(this._isAuthenticated());
        this._sessionChecked.set(true);
      });
  }

  continue(email: string): Observable<ContinueResponse> {
    return this.http.post<ContinueResponse>('/api/auth/continue', { email }, { withCredentials: true });
  }

  login(email: string, password: string): Observable<StepResponse> {
    return this.http.post<StepResponse>('/api/auth/login', { email, password }, { withCredentials: true });
  }

  register(email: string, password: string, passwordConfirmation: string): Observable<StepResponse> {
    return this.http.post<StepResponse>('/api/auth/register',
      { email, password, passwordConfirmation }, { withCredentials: true });
  }

  verifyOtp(preAuthToken: string, otp: string): Observable<void> {
    return this.http.post<void>('/api/auth/verify-otp',
      { preAuthToken, otp }, { withCredentials: true })
      .pipe(tap(() => {
        this.checkSession();
      }));
  }

  logout(): void {
    this.http.post('/api/auth/logout', {}, { withCredentials: true })
      .subscribe(() => {
        this._isAuthenticated.set(false);
        this._userEmail.set(null);
        this.writeAuthHint(false);
        this.router.navigate(['/']);
      });
  }

  completeProfile(fullName: string, age: number): Observable<void> {
    return this.http.post<void>('/api/auth/complete',
      { fullName, age }, { withCredentials: true });
  }

  refreshSession(): void {
    if (this.isBrowser) {
      this.checkSession();
    }
  }

  private readonly _oauthProfileName = signal<string | null>(null);
  private readonly _showProfileModal = signal(false);
  private readonly _oauthError = signal(false);
  private readonly _authRequired = signal(false);

  readonly authRequired = this._authRequired.asReadonly();

  requireAuth(): void {
    this._authRequired.set(true);
  }

  clearAuthRequired(): void {
    this._authRequired.set(false);
  }

  private handleOAuthCallback(): boolean {
    if (!this.isBrowser) return false;

    const params = new URLSearchParams(window.location.search);
    const authResult = params.get('auth');
    if (!authResult) return false;

    // Clean up URL
    const url = new URL(window.location.href);
    url.searchParams.delete('auth');
    url.searchParams.delete('name');
    window.history.replaceState({}, '', url.pathname);

    if (authResult === 'success') {
      this.checkSession();
    } else if (authResult === 'profile-needed') {
      this.checkSession();
      const name = params.get('name');
      this._oauthProfileName.set(name);
      this._showProfileModal.set(true);
    } else if (authResult === 'error') {
      this._oauthError.set(true);
    }
    return true;
  }
  readonly oauthProfileName = this._oauthProfileName.asReadonly();
  readonly showProfileModal = this._showProfileModal.asReadonly();
  readonly oauthError = this._oauthError.asReadonly();

  clearProfileModal(): void {
    this._showProfileModal.set(false);
    this._oauthProfileName.set(null);
  }

  getInitials(): string {
    const email = this._userEmail();
    if (!email) return '?';
    return email.charAt(0).toUpperCase();
  }
}
