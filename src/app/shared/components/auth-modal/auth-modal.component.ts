import { Component, computed, inject, signal, output } from '@angular/core';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, AuthErrorResponse } from '../../services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';

type Step = 'email' | 'login' | 'register' | 'verify_otp' | 'profile';

@Component({
  selector: 'app-auth-modal',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './auth-modal.component.html',
  styleUrl: './auth-modal.component.css'
})
export class AuthModalComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly close = output<void>();

  protected readonly step = signal<Step>('email');
  protected readonly email = signal('');
  protected readonly password = signal('');
  protected readonly otpDigits = signal(['', '', '', '', '', '']);
  protected readonly showPassword = signal(false);
  protected readonly fullName = signal('');
  protected readonly age = signal('');
  protected readonly isOtpComplete = computed(() => this.otpDigits().every(d => d.length === 1));
  protected readonly error = signal<string | null>(null);
  protected readonly isLoading = signal(false);
  protected readonly preAuthToken = signal<string | null>(null);
  private otpSource: 'login' | 'register' = 'login';

  private static readonly ERROR_MESSAGES: Record<string, string> = {
    invalid_email: 'Invalid email format',
    invalid_credentials: 'Wrong password',
    password_too_short: 'Password must be at least 8 characters',
    invalid_otp: 'Invalid verification code',
    invalid_pre_auth: 'Session expired, please start over',
    email_exists: 'Email already registered',
    user_not_found: 'User not found',
    otp_expired: 'Verification code has expired, please request a new one',
    otp_max_attempts: 'Too many incorrect attempts, please request a new code',
    otp_rate_limited: 'Too many requests, please wait before requesting a new code',
  };

  onContinue(): void {
    this.error.set(null);
    this.isLoading.set(true);

    this.authService.continue(this.email()).subscribe({
      next: (response) => {
        this.step.set(response.next_step as Step);
        this.isLoading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.handleError(err);
        this.isLoading.set(false);
      }
    });
  }

  onLogin(): void {
    this.error.set(null);
    this.isLoading.set(true);

    this.authService.login(this.email(), this.password()).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        if (response.next_step === 'authenticated') {
          this.authService.refreshSession();
          this.close.emit();
        } else if (response.next_step === 'verify_otp') {
          this.preAuthToken.set(response.pre_auth_token);
          this.otpSource = 'login';
          this.step.set('verify_otp');
        } else if (response.next_step === 'PERSONAL_INFORMATION') {
          this.step.set('profile');
        }
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading.set(false);
        this.handleError(err);
      }
    });
  }

  onRegister(): void {
    this.error.set(null);
    this.isLoading.set(true);

    this.authService.register(this.email(), this.password(), this.password()).subscribe({
      next: (response) => {
        this.preAuthToken.set(response.pre_auth_token);
        this.otpSource = 'register';
        this.step.set('verify_otp');
        this.isLoading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.handleError(err);
        this.isLoading.set(false);
      }
    });
  }

  onResendOtp(): void {
    this.error.set(null);
    this.isLoading.set(true);
    this.otpDigits.set(['', '', '', '', '', '']);

    const request$ = this.otpSource === 'login'
      ? this.authService.login(this.email(), this.password())
      : this.authService.register(this.email(), this.password(), this.password());

    request$.subscribe({
      next: (response) => {
        this.preAuthToken.set(response.pre_auth_token);
        this.isLoading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.handleError(err);
        this.isLoading.set(false);
      }
    });
  }

  onOtpInput(index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/\D/g, '');
    input.value = value;

    const digits = [...this.otpDigits()];
    digits[index] = value;
    this.otpDigits.set(digits);

    if (value && index < 5) {
      const next = input.parentElement?.children[index + 1] as HTMLInputElement;
      next?.focus();
    }
  }

  onOtpKeydown(index: number, event: KeyboardEvent): void {
    if (event.key === 'Backspace' && !this.otpDigits()[index] && index > 0) {
      const prev = (event.target as HTMLElement).parentElement?.children[index - 1] as HTMLInputElement;
      prev?.focus();
    }
  }

  onOtpPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pasted = event.clipboardData?.getData('text')?.replace(/\D/g, '') ?? '';
    if (pasted.length === 6) {
      this.otpDigits.set(pasted.split(''));
      const container = (event.target as HTMLElement).parentElement;
      (container?.children[5] as HTMLInputElement)?.focus();
    }
  }

  protected onVerifyOtp(): void {
    const otp = this.otpDigits().join('');
    const token = this.preAuthToken();
    if (otp.length !== 6 || !token) return;

    this.error.set(null);
    this.isLoading.set(true);

    this.authService.verifyOtp(token, otp).subscribe({
      next: () => {
        this.isLoading.set(false);
        if (this.otpSource === 'register') {
          this.error.set(null);
          this.step.set('profile');
        } else {
          this.close.emit();
          if (this.router.url.startsWith('/chat/')) {
            this.router.navigate(['/']);
          }
        }
      },
      error: (err: HttpErrorResponse) => {
        this.handleError(err);
        this.isLoading.set(false);
        this.otpDigits.set(['', '', '', '', '', '']);
      }
    });
  }

  onCompleteProfile(): void {
    this.error.set(null);
    if (!this.fullName().trim()) {
      this.error.set('Please enter your name');
      return;
    }
    const ageNum = parseInt(this.age(), 10);
    if (!ageNum || ageNum < 1 || ageNum > 150) {
      this.error.set('Please enter a valid age');
      return;
    }
    // TODO: send profile to backend in next iteration
    this.close.emit();
    if (this.router.url.startsWith('/chat/')) {
      this.router.navigate(['/']);
    }
  }

  private handleError(err: HttpErrorResponse): void {
    const body = err.error as AuthErrorResponse | undefined;
    if (body?.error === 'invalid_pre_auth') {
      this.step.set('email');
      this.password.set('');
      this.preAuthToken.set(null);
    }
    const msg = body?.error
      ? (AuthModalComponent.ERROR_MESSAGES[body.error] ?? body.message)
      : 'Something went wrong';
    this.error.set(msg);
  }
}
