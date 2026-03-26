import { Component, signal, ElementRef, inject, HostListener, ViewChild, AfterViewChecked } from '@angular/core';

@Component({
  selector: 'app-prompt-actions-menu',
  standalone: true,
  templateUrl: './prompt-actions-menu.component.html',
  styleUrl: './prompt-actions-menu.component.css',
})
export class PromptActionsMenuComponent implements AfterViewChecked {
  private readonly elementRef = inject(ElementRef);
  protected readonly menuOpen = signal(false);

  @ViewChild('dropdown') dropdownRef?: ElementRef<HTMLElement>;

  toggle(): void {
    this.menuOpen.update(v => !v);
  }

  ngAfterViewChecked(): void {
    this.positionDropdown();
  }

  private positionDropdown(): void {
    if (!this.menuOpen() || !this.dropdownRef) return;
    const button = this.elementRef.nativeElement.querySelector('button') as HTMLElement;
    const dropdown = this.dropdownRef.nativeElement;
    const rect = button.getBoundingClientRect();
    dropdown.style.left = `${rect.left}px`;
    dropdown.style.top = `${rect.bottom + 8}px`;
    dropdown.style.bottom = 'auto';
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.menuOpen.set(false);
    }
  }
}
