import {ChangeDetectionStrategy, Component, computed, input, output} from '@angular/core';

@Component({
  selector: 'app-attachment-card',
  standalone: true,
  templateUrl: './attachment-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AttachmentCardComponent {
  readonly filename = input.required<string>();
  readonly mimeType = input.required<string>();
  readonly fileSize = input.required<number>();
  readonly progress = input<number | null>(null);
  readonly removable = input<boolean>(false);
  readonly attachmentId = input<string | null>(null);
  readonly clickable = input<boolean>(false);

  readonly remove = output<void>();
  readonly cardClicked = output<void>();

  readonly isPdf = computed(() => this.mimeType() === 'application/pdf');

  readonly formatLabel = computed(() => {
    const mime = this.mimeType();
    if (mime === 'application/pdf') return 'PDF';
    if (mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return 'DOCX';
    return 'FILE';
  });

  readonly formattedSize = computed(() => {
    const bytes = this.fileSize();
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  });

  readonly isUploading = computed(() => {
    const p = this.progress();
    return p !== null && p < 100;
  });

  onRemove(event: Event): void {
    event.stopPropagation();
    this.remove.emit();
  }

  onClick(): void {
    if (this.clickable()) {
      this.cardClicked.emit();
    }
  }
}
