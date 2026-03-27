import { Component, inject, signal, ElementRef, HostListener } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-user-avatar',
  standalone: true,
  templateUrl: './user-avatar.component.html',
})
export class UserAvatarComponent {
  private readonly elementRef = inject(ElementRef);
  protected readonly authService = inject(AuthService);
  protected readonly menuOpen = signal(false);
  protected readonly logoutDialogOpen = signal(false);

  toggleMenu(): void {
    this.menuOpen.update(v => !v);
  }

  onLogoutClick(): void {
    this.menuOpen.set(false);
    this.logoutDialogOpen.set(true);
  }

  confirmLogout(): void {
    this.logoutDialogOpen.set(false);
    this.authService.logout();
  }

  cancelLogout(): void {
    this.logoutDialogOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.menuOpen.set(false);
    }
  }
}
