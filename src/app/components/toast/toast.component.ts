import {Component, OnDestroy} from '@angular/core';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-toast',
  imports: [
    NgIf
  ],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.css'
})
export class ToastComponent implements OnDestroy {
  public isVisible: boolean = false;
  public toastMessage: string = ''
  public currentProgress: number = 0;

  private toastDuration: number = 0;
  private toastTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private progressIntervalId: ReturnType<typeof setInterval> | null = null;
  private readonly PROGRESS_INTERVAL_MS = 50; // Update progress every 50ms

  constructor() {}

  public show(message: string, duration: number): void {
    this.isVisible = true;
    this.toastMessage = message;
    this.toastDuration = duration;
    this.currentProgress = 0;

    this.clearTimers();

    if (this.toastDuration > 0) {
      this.toastTimeoutId = setTimeout(() => {
        this.hide();
      }, this.toastDuration);
      const startTime = Date.now();
      this.progressIntervalId = setInterval(() => {
        const elapsedTime = Date.now() - startTime;
        if (elapsedTime >= this.toastDuration) {
          this.currentProgress = 100;
          this.clearProgressInterval(); // Stop interval
        } else {
          this.currentProgress = (elapsedTime / this.toastDuration) * 100;
        }
      }, this.PROGRESS_INTERVAL_MS);
    } else {
      // If duration is 0 or less, it's a persistent toast until manually hidden
      // No progress bar needed in this case, or show full if desired
      this.currentProgress = 100; // Or 0, depending on desired behavior for no-duration toasts
    }
  }

  public hide(): void {
    if (!this.isVisible) {
      return; // Already hidden or in the process of hiding
    }

    this.clearTimers();
    this.isVisible = false;
    this.toastMessage = '';
    this.currentProgress = 0;
  }

  private clearToastTimeout(): void {
    if (this.toastTimeoutId) {
      clearTimeout(this.toastTimeoutId);
      this.toastTimeoutId = null;
    }
  }

  private clearProgressInterval(): void {
    if (this.progressIntervalId) {
      clearInterval(this.progressIntervalId);
      this.progressIntervalId = null;
    }
  }

  private clearTimers(): void {
    this.clearToastTimeout();
    this.clearProgressInterval();
  }

  ngOnDestroy(): void {
    this.clearTimers();
  }
}
