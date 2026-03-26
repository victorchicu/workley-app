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

  private readonly _isAuthenticated = signal(false);
  private readonly _userEmail = signal<string | null>(null);
  private readonly _sessionChecked = signal(false);

  readonly isAuthenticated = this._isAuthenticated.asReadonly();
  readonly userEmail = this._userEmail.asReadonly();
  readonly sessionChecked = this._sessionChecked.asReadonly();

  constructor() {
    if (this.isBrowser) {
      this.checkSession();
    }
  }

  private checkSession(): void {
    this.http.get<MeResponse>('/api/auth/me', { withCredentials: true })
      .pipe(catchError(() => of(null)))
      .subscribe(response => {
        if (response) {
          this._isAuthenticated.set(true);
          this._userEmail.set(response.email);
        }
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
        this.router.navigate(['/']);
      });
  }

  getInitials(): string {
    const email = this._userEmail();
    if (!email) return '?';
    return email.charAt(0).toUpperCase();
  }
}
