import {ChangeDetectionStrategy, Component, input, output, signal} from '@angular/core';
import {NgIf} from '@angular/common';
import {environment} from '../../../../../environments/environment';

@Component({
  selector: 'app-share-modal',
  standalone: true,
  imports: [NgIf],
  templateUrl: './share-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShareModalComponent {
  readonly messageId = input.required<string>();
  readonly messageText = input.required<string>();
  readonly close = output<void>();

  readonly copied = signal(false);

  get shareUrl(): string {
    return `${environment.publicUrl}/shared/${this.messageId()}`;
  }

  onCopyLink(): void {
    navigator.clipboard.writeText(this.shareUrl).then(() => {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 1000);
    }).catch(() => {});
  }
}
