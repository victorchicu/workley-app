import {Component, inject, signal, DestroyRef} from '@angular/core';
import {Router, RouterOutlet, RouterLink, NavigationEnd} from '@angular/router';
import {NgClass} from '@angular/common';
import {HeaderComponent} from '../header/header.component';
import {FooterComponent} from '../footer/footer.component';
import {filter} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    NgClass,
    HeaderComponent,
    FooterComponent,
  ],
  templateUrl: './main.component.html',
  styleUrl: './main.component.css'
})
export class MainComponent {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly isInChat = signal(this.router.url.startsWith('/chat/'));

  constructor() {
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(e => {
      this.isInChat.set(e.urlAfterRedirects.startsWith('/chat/'));
    });
  }

  newChat(): void {
    if (this.isInChat()) {
      this.router.navigate(['/'])
        .then(r =>
          console.log("Create new chat"));
    }
  }
}
