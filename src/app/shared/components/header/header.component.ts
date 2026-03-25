import { Component, inject, signal, ElementRef, HostListener } from '@angular/core';
import { NgClass } from '@angular/common';
import { ThemeService, ThemePreference } from '../../services/theme.service';
import { AuthService } from '../../services/auth.service';
import { AuthModalComponent } from '../auth-modal/auth-modal.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [NgClass, AuthModalComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  private readonly elementRef = inject(ElementRef);
  protected readonly themeService = inject(ThemeService);
  protected readonly authService = inject(AuthService);
  protected readonly dropdownOpen = signal(false);
  protected readonly authModalOpen = signal(false);

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
