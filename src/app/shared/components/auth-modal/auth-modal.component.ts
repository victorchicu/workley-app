import { Component, inject, signal, output, HostListener } from '@angular/core';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, AuthErrorResponse } from '../../services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';

type Step = 'email' | 'login' | 'register' | 'verify_otp';

@Component({
  selector: 'app-auth-modal',
  standalone: true,
  imports: [NgClass, FormsModule],
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
  protected readonly passwordConfirmation = signal('');
  protected readonly otpDigits = signal(['', '', '', '']);
  protected readonly error = signal<string | null>(null);
  protected readonly isLoading = signal(false);
  protected readonly preAuthToken = signal<string | null>(null);

  private static readonly ERROR_MESSAGES: Record<string, string> = {
    invalid_email: 'Invalid email format',
    invalid_credentials: 'Wrong password',
    passwords_mismatch: "Passwords don't match",
    password_too_short: 'Password must be at least 8 characters',
    invalid_otp: 'Invalid verification code',
    invalid_pre_auth: 'Session expired, please start over',
    email_exists: 'Email already registered',
    user_not_found: 'User not found',
  };

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.close.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.close.emit();
    }
  }

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
        this.preAuthToken.set(response.pre_auth_token);
        this.step.set('verify_otp');
        this.isLoading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.handleError(err);
        this.isLoading.set(false);
      }
    });
  }

  onRegister(): void {
    this.error.set(null);
    this.isLoading.set(true);

    this.authService.register(this.email(), this.password(), this.passwordConfirmation()).subscribe({
      next: (response) => {
        this.preAuthToken.set(response.pre_auth_token);
        this.step.set('verify_otp');
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

    if (value && index < 3) {
      const next = input.parentElement?.children[index + 1] as HTMLInputElement;
      next?.focus();
    }

    if (digits.every(d => d.length === 1)) {
      this.onVerifyOtp();
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
    if (pasted.length === 4) {
      this.otpDigits.set(pasted.split(''));
      const container = (event.target as HTMLElement).parentElement;
      (container?.children[3] as HTMLInputElement)?.focus();
      this.onVerifyOtp();
    }
  }

  private onVerifyOtp(): void {
    const otp = this.otpDigits().join('');
    const token = this.preAuthToken();
    if (otp.length !== 4 || !token) return;

    this.error.set(null);
    this.isLoading.set(true);

    this.authService.verifyOtp(token, otp).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.close.emit();
        if (this.router.url.startsWith('/chat/')) {
          this.router.navigate(['/']);
        }
      },
      error: (err: HttpErrorResponse) => {
        this.handleError(err);
        this.isLoading.set(false);
        this.otpDigits.set(['', '', '', '']);
      }
    });
  }

  private handleError(err: HttpErrorResponse): void {
    const body = err.error as AuthErrorResponse | undefined;
    if (body?.error === 'invalid_pre_auth') {
      this.step.set('email');
      this.password.set('');
      this.passwordConfirmation.set('');
      this.preAuthToken.set(null);
    }
    const msg = body?.error
      ? (AuthModalComponent.ERROR_MESSAGES[body.error] ?? body.message)
      : 'Something went wrong';
    this.error.set(msg);
  }
}
