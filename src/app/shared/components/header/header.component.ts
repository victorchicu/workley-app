import { Component, inject, signal, ElementRef, DestroyRef, HostListener } from '@angular/core';
import { NgClass } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ThemeService, ThemePreference } from '../../services/theme.service';
import { AuthService } from '../../services/auth.service';
import { AuthModalComponent } from '../auth-modal/auth-modal.component';
import { UserAvatarComponent } from '../user-avatar/user-avatar.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [NgClass, AuthModalComponent, UserAvatarComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  private readonly elementRef = inject(ElementRef);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly themeService = inject(ThemeService);
  protected readonly authService = inject(AuthService);
  protected readonly dropdownOpen = signal(false);
  protected readonly authModalOpen = signal(false);
  protected readonly isInChat = signal(false);

  constructor() {
    this.isInChat.set(this.router.url.startsWith('/chat/'));
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(e => {
      this.isInChat.set(e.urlAfterRedirects.startsWith('/chat/'));
    });
  }

  newChat(): void {
    if (this.isInChat()) {
      this.router.navigate(['/']);
    }
  }

  toggleDropdown(): void {
    this.dropdownOpen.update(v => !v);
  }

  selectTheme(theme: ThemePreference): void {
    this.themeService.setTheme(theme);
    this.dropdownOpen.set(false);
  }

  openAuthModal(): void {
    this.authModalOpen.set(true);
  }

  closeAuthModal(): void {
    this.authModalOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.dropdownOpen.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.dropdownOpen.set(false);
  }
}
