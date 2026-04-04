import { Component, inject, signal, ElementRef, HostListener } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-avatar',
  standalone: true,
  templateUrl: './user-avatar.component.html',
})
export class UserAvatarComponent {
  private readonly elementRef = inject(ElementRef);
  protected readonly authService = inject(AuthService);
  private readonly router = inject(Router);
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

  onMyJobsClick(): void {
    this.menuOpen.set(false);
    this.router.navigate(['/my/jobs']);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.menuOpen.set(false);
    }
  }
}
