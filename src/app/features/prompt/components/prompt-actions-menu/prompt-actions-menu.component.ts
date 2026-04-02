import {Component, signal, ElementRef, inject, HostListener, ViewChild, AfterViewChecked, output} from '@angular/core';

@Component({
  selector: 'app-prompt-actions-menu',
  standalone: true,
  templateUrl: './prompt-actions-menu.component.html',
  styleUrl: './prompt-actions-menu.component.css',
})
export class PromptActionsMenuComponent implements AfterViewChecked {
  private readonly elementRef = inject(ElementRef);
  protected readonly menuOpen = signal(false);

  readonly fileSelected = output<File>();

  @ViewChild('dropdown') dropdownRef?: ElementRef<HTMLElement>;
  @ViewChild('fileInput') fileInputRef?: ElementRef<HTMLInputElement>;

  toggle(): void {
    this.menuOpen.update(v => !v);
  }

  onUploadResume(): void {
    this.menuOpen.set(false);
    this.fileInputRef?.nativeElement.click();
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.fileSelected.emit(input.files[0]);
      input.value = '';
    }
  }

  ngAfterViewChecked(): void {
    this.positionDropdown();
  }

  private positionDropdown(): void {
    if (!this.menuOpen() || !this.dropdownRef) return;
    const button = this.elementRef.nativeElement.querySelector('button:first-child') as HTMLElement;
    const dropdown = this.dropdownRef.nativeElement;
    const rect = button.getBoundingClientRect();
    const dropdownHeight = dropdown.offsetHeight;
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUpward = spaceBelow < dropdownHeight + 16;

    dropdown.style.left = `${rect.left}px`;
    if (openUpward) {
      dropdown.style.bottom = `${window.innerHeight - rect.top + 8}px`;
      dropdown.style.top = 'auto';
    } else {
      dropdown.style.top = `${rect.bottom + 8}px`;
      dropdown.style.bottom = 'auto';
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.menuOpen.set(false);
    }
  }
}
