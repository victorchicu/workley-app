import {ChangeDetectionStrategy, Component, inject, input, output, signal, OnInit, OnDestroy} from '@angular/core';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';
import {HttpClient} from '@angular/common/http';

@Component({
  selector: 'app-pdf-preview-dialog',
  standalone: true,
  templateUrl: './pdf-preview-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PdfPreviewDialogComponent implements OnInit, OnDestroy {
  private readonly sanitizer = inject(DomSanitizer);
  private readonly http = inject(HttpClient);

  readonly filename = input.required<string>();
  readonly downloadUrl = input.required<string>();
  readonly close = output<void>();

  readonly blobUrl = signal<SafeResourceUrl | null>(null);
  private objectUrl: string | null = null;

  ngOnInit(): void {
    this.http.get(this.downloadUrl(), {responseType: 'blob', withCredentials: true})
      .subscribe(blob => {
        this.objectUrl = URL.createObjectURL(blob);
        this.blobUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(this.objectUrl));
      });
  }

  ngOnDestroy(): void {
    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl);
    }
  }

  onClose(): void {
    this.close.emit();
  }

  onDownload(): void {
    window.open(this.downloadUrl(), '_blank');
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close.emit();
    }
  }
}
